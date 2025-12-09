<?php
declare( strict_types=1 );

class WPBS_Loop {

	private static WPBS_Loop $instance;

	public static function init(): WPBS_Loop {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Loop();
		}

		return self::$instance;
	}

	private function __construct() {
		add_action( 'rest_api_init', [ $this, 'register_endpoint' ] );
	}

	/**
	 * Output loop template JSON for frontend hydration
	 */
	public function output_loop_script( array $template_block, array $loop_data, array $query, int $page = 1 ): void {
		global $wp_query;

		// If using the main query, use its query_vars directly
		if ( ( $query['post_type'] ?? null ) === 'current' && $wp_query instanceof WP_Query ) {
			$query = $wp_query->query_vars;
		}

		// Remove empty keys
		$query_clean = WPBS::clean_array( $query );

		// Encode template and pagination JSON
		$template_json   = wp_json_encode( $template_block ?? [], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
		$pagination_data = [
			'page'       => max( 1, $page ),
			'totalPages' => $loop_data['pages'] ?? 1,
			'totalPosts' => $loop_data['total'] ?? 0,
			'query'      => $query_clean,
		];
		$pagination_json = wp_json_encode( $pagination_data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );

		// Output JSON script tag
		echo '<script type="application/json" data-wpbs-loop-template>';
		echo json_encode( [
			'template'   => json_decode( $template_json ),
			'pagination' => json_decode( $pagination_json ),
		], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
		echo '</script>';
	}

	public function render_from_php( array $template, array $query = [], int $page = 1 ): array {
		// Validate template
		if ( empty( $template['blockName'] ) ) {
			return [
				'html'  => '',
				'total' => 0,
				'pages' => 1,
				'page'  => 1,
				'error' => 'Invalid template passed to render_from_php.',
			];
		}

		// Sanitize template recursively
		$template = self::sanitize_block_template( $template );

		// Sanitize query
		$query_clean = $this->sanitize_query( $query );

		// Ensure page is at least 1
		$page = max( 1, $page );

		// Render
		return $this->render_loop( $template, $query_clean, $page );
	}


	public function register_endpoint(): void {

		register_rest_route( 'wpbs/v1', '/loop', [
			'methods'             => \WP_REST_Server::CREATABLE,
			'callback'            => [ $this, 'handle_request' ],
			'permission_callback' => '__return_true',
			'args'                => [
				'template' => [
					'type'        => 'object',
					'required'    => true,
					'description' => 'Block AST for the loop card.',
				],
				'query'    => [
					'type'     => 'object',
					'required' => true,
				],
				'page'     => [
					'type'    => 'integer',
					'default' => 1,
				],
			],
		] );
	}

	public function handle_request( WP_REST_Request $request ): WP_REST_Response {

		$template  = $request->get_param( 'template' );
		$query_raw = $request->get_param( 'query' );
		$page      = max( 1, intval( $request->get_param( 'page' ) ?? 1 ) );

		if ( ! is_array( $template ) || empty( $template['blockName'] ) ) {
			return $this->error( 'Invalid template.' );
		}

		// Sanitize template recursively
		$template = self::sanitize_block_template( $template );

		if ( ! is_array( $query_raw ) ) {
			return $this->error( 'Invalid query.' );
		}

		$query = $this->sanitize_query( $query_raw );

		// run SSR
		$output = $this->render_loop( $template, $query, $page );

		return rest_ensure_response( $output );
	}


	public function sanitize_block_template( $block, &$counter = 0, $max_blocks = 30 ): array {
		if ( ++ $counter > $max_blocks ) {
			return [];
		}

		return [
			'blockName'    => $block['blockName'] ?? '',
			'attrs'        => array_map( [ __CLASS__, 'recursive_sanitize' ], $block['attrs'] ?? [] ),
			'innerBlocks'  => array_map( function ( $b ) use ( &$counter, $max_blocks ) {
				return self::sanitize_block_template( $b, $counter, $max_blocks );
			}, $block['innerBlocks'] ?? [] ),
			'innerHTML'    => wp_kses_post( $block['innerHTML'] ?? '' ),          // Allow safe HTML
			'innerContent' => array_map( function ( $item ) {
				return is_string( $item ) ? wp_kses_post( $item ) : null;          // Allow safe HTML
			}, $block['innerContent'] ?? [] ),
		];
	}

	public function recursive_sanitize( $input ) {
		if ( is_array( $input ) ) {
			$sanitized = [];

			foreach ( $input as $key => $value ) {
				$sanitized_key               = is_string( $key ) ? sanitize_text_field( $key ) : $key;
				$sanitized[ $sanitized_key ] = self::recursive_sanitize( $value );
			}

			return $sanitized;

		} elseif ( is_string( $input ) ) {
			return sanitize_text_field( $input );

		} elseif ( is_int( $input ) ) {
			return intval( $input );

		} elseif ( is_float( $input ) ) {
			return floatval( $input );

		} elseif ( is_bool( $input ) ) {
			return (bool) $input;

		} elseif ( is_null( $input ) ) {
			return null;

		} else {
			return $input;
		}
	}

	private function render_loop( array $template_block, array $query, int $page ): array {

		$html  = '';
		$index = 0;

		/*
 * ===============================================================
 * 0. MEDIA GALLERY LOOP MODE (gallery object passed)
 * ===============================================================
 */
		WPBS::console_log( $query );
		if ( ! empty( $query['gallery_id'] ) ) {

			$gallery_id = intval( $query['gallery_id'] );

			/**
			 * Load full ACF field: expected structure:
			 * [
			 *   'images' => [ ID, ID, ... ],
			 *   'videos' => [ [videoData], [videoData], ... ]
			 * ]
			 */
			$acf = get_field( 'wpbs', $gallery_id );

			WPBS::console_log( $acf );

			if ( empty( $acf ) || ! is_array( $acf ) ) {
				return [
					'html'  => '',
					'total' => 0,
					'pages' => 1,
					'page'  => $page,
				];
			}

			$images = ! empty( $acf['images'] ) && is_array( $acf['images'] ) ? $acf['images'] : [];
			$videos = ! empty( $acf['videos'] ) && is_array( $acf['videos'] ) ? $acf['videos'] : [];

			// Normalize → unified media objects
			$normalized_images = array_map(
				fn( $id ) => [
					'type' => 'image',
					'id'   => intval( $id ),
				],
				$images
			);

			$normalized_videos = array_values(
				array_filter(
					array_map(
						fn( $item ) => is_array( $item )
							? array_merge( [ 'type' => 'video' ], $item )
							: null,
						$videos
					)
				)
			);

			// Merge into one list
			$merged = array_values( array_merge( $normalized_images, $normalized_videos ) );

			if ( empty( $merged ) ) {
				return [
					'html'  => '',
					'total' => 0,
					'pages' => 1,
					'page'  => $page,
				];
			}

			// Pagination
			$per_page = intval( $query['page_size'] ?? count( $merged ) );
			$offset   = ( $page - 1 ) * $per_page;

			$paged_items = array_slice( $merged, $offset, $per_page );
			$total_items = count( $merged );
			$total_pages = $per_page > 0 ? ceil( $total_items / $per_page ) : 1;

			$html  = '';
			$index = 0;

			foreach ( $paged_items as $media ) {

				$html .= $this->render_card_from_ast(
					$template_block,
					$query,                // gallery query object
					null,    // attachment ID or null
					$index,
					null,
					$media                 // new $media argument
				);

				$index ++;
			}

			return [
				'html'  => $html,
				'total' => $total_items,
				'pages' => $total_pages,
				'page'  => $page,
				'query' => $query,
			];
		}


		/*
		 * ===============================================================
		 * 1. TAXONOMY LOOP MODE (loopTerms = true)
		 * ===============================================================
		 */
		if ( ! empty( $query['loopTerms'] ) && ! empty( $query['taxonomy'] ) ) {

			$taxonomy = sanitize_key( $query['taxonomy'] );
			$per_page = $query['posts_per_page'] ?? 12;
			$page     = max( 1, $page );
			$offset   = ( $page - 1 ) * $per_page;

			// Query terms with pagination
			$term_query = new WP_Term_Query( [
				'taxonomy'   => $taxonomy,
				'hide_empty' => true,
				'number'     => $per_page,
				'offset'     => $offset,
				'fields'     => 'all',
			] );

			$terms = $term_query->get_terms();

			if ( is_wp_error( $terms ) || empty( $terms ) ) {
				return [
					'html'  => '',
					'total' => 0,
					'pages' => 1,
					'page'  => 1,
				];
			}

			// Count total terms for pagination
			$total_terms = (int) wp_count_terms( [
				'taxonomy'   => $taxonomy,
				'hide_empty' => true,
			] );

			$html  = '';
			$index = 0;

			foreach ( $terms as $term ) {
				$html .= $this->render_card_from_ast(
					$template_block,
					$query,
					null,
					$index,
					$term->term_id
				);
				$index ++;
			}

			$total_pages = $per_page > 0 ? ceil( $total_terms / $per_page ) : 1;

			return [
				'html'   => $html,
				'total'  => $total_terms,
				'pages'  => $total_pages,
				'page'   => $page,
				'$query' => $query,
			];
		}


		/*
		 * ===============================================================
		 * 2. CURRENT QUERY MODE (post_type === "current")
		 * ===============================================================
		 */
		if ( ( $query['post_type'] ?? null ) === 'current' ) {

			global $wp_query;

			// Avoid fatal if WP_Query not set
			if ( ! ( $wp_query instanceof WP_Query ) || ! $wp_query->have_posts() ) {


				$current_url = $_SERVER['HTTP_REFERER'] ?? '';
				$post_id     = url_to_postid( $current_url ); // returns 0 if no match


				return [
					'html'  => '',
					'total' => 0,
					'pages' => 1,
					'page'  => 1,
					'debug' => [
						'cqo'         => get_queried_object(),
						'postId'      => $post_id,
						'current_url' => $current_url,
					]
				];
			}

			$total_posts = intval( $wp_query->found_posts );
			$total_pages = max( 1, intval( $wp_query->max_num_pages ) );

			while ( $wp_query->have_posts() ) {
				$wp_query->the_post();
				$post_id = get_the_ID();

				$html .= $this->render_card_from_ast(
					$template_block,
					$query,
					$post_id,
					$index,
					null // termId not used in normal post loops
				);

				$index ++;
			}

			wp_reset_postdata();

			return [
				'html'  => $html,
				'total' => $total_posts,
				'pages' => $total_pages,
				'page'  => max( 1, $page ),
			];
		}

		/*
		 * ===============================================================
		 * 3. NORMAL QUERY MODE (default behavior)
		 * ===============================================================
		 */

		// Build query args from incoming FE query params
		$args = $this->build_query_args( $query, $page );

		$args['post_status']         = 'publish';
		$args['ignore_sticky_posts'] = true;
		$args['has_password']        = false;

		$args['perm'] = 'readable';

		$wpq = new WP_Query( $args );

		$total_posts = intval( $wpq->found_posts );
		$total_pages = $args['posts_per_page'] > 0
			? max( 1, (int) ceil( $total_posts / $args['posts_per_page'] ) )
			: 1;

		while ( $wpq->have_posts() ) {
			$wpq->the_post();
			$post_id = get_the_ID();

			$html .= $this->render_card_from_ast(
				$template_block,
				$query,
				$post_id,
				$index,
				null // termId not used here unless template logic needs it
			);

			$index ++;
		}

		wp_reset_postdata();

		return [
			'html'   => $html,
			'total'  => $total_posts,
			'pages'  => $total_pages,
			'page'   => $page,
			'$query' => $query,
		];
	}


	/*───────────────────────────────────────────────────────────────
		CARD RENDERING FROM AST
	───────────────────────────────────────────────────────────────*/
	private function render_card_from_ast(
		array $template,
		array $query,
		?int $post_id,
		int $index,
		?int $term_id = null,
		$media = []
	): string {

		$block = $template;

		$block['innerBlocks'] = $template['innerBlocks'] ?? [];

		if ( $post_id !== null ) {
			$block['attrs']['postId'] = $post_id;
		}

		if ( $term_id !== null ) {
			$block['attrs']['termId']      = $term_id;
			$block['attrs']['wpbs/termId'] = $term_id;
		}

		$block['attrs']['index'] = $index;

		$taxonomy = $query['taxonomy'] ?? null;

		$context = [
			'postId'   => $post_id,
			'termId'   => $term_id,
			'taxonomy' => $taxonomy,

			'wpbs/media'    => $media,
			'wpbs/postId'   => $post_id,
			'wpbs/termId'   => $term_id,
			'wpbs/taxonomy' => $taxonomy,
			'wpbs/index'    => $index,
		];

		$instance = new WP_Block( $block, $context );

		$instance->context['termId']    = $term_id;
		$instance->attributes['termId'] = $term_id;

		return $instance->render();
	}


	/*───────────────────────────────────────────────────────────────
		SANITIZATION, QUERY BUILDING, ERRORS (UNCHANGED)
	───────────────────────────────────────────────────────────────*/

	private function sanitize_query( array $q ): array {
		global $wp_query;

		$clean = [];

		// Allowed safe keys for our loop system
		$allowed = [
			'post_type',
			'posts_per_page',
			'paged',
			'orderby',
			'order',
			'taxonomy',
			'term',
			'include',
			'exclude',
			'post__in',
			'post__not_in',
			'loopTerms',
		];

		// Strip obviously dangerous keys
		$forbidden_patterns = [
			'/request/i',
			'/sql/i',
			'/meta_query/i',
			'/meta_key/i',
			'/meta_value/i',
			'/cache/i',
			'/suppress_filters/i',
			'/tax_query/i', // never trust FE tax_query
		];

		foreach ( $q as $key => $value ) {
			foreach ( $forbidden_patterns as $pattern ) {
				if ( preg_match( $pattern, $key ) ) {
					continue 2; // skip this key entirely
				}
			}

			// Only allow keys we explicitly support
			if ( ! in_array( $key, $allowed, true ) ) {
				continue;
			}

			// General cleaning
			switch ( $key ) {
				case 'post_type':
					$pt = sanitize_key( $value );

					// Current = main query cloning
					if ( $pt === 'current' ) {
						$clean['post_type']      = 'current';
						$clean['posts_per_page'] = (int) get_option( 'posts_per_page', 10 );
					} else {
						$public             = get_post_types( [ 'public' => true ], 'names' );
						$clean['post_type'] = in_array( $pt, $public, true ) ? $pt : 'post';
					}
					break;

				case 'posts_per_page':
					// Only used for non-current queries
					if ( ( $clean['post_type'] ?? null ) !== 'current' ) {
						$clean['posts_per_page'] = max( - 1, (int) $value );
					}
					break;

				case 'paged':
					$clean['paged'] = max( 1, (int) $value );
					break;

				case 'orderby':
					$clean['orderby'] = sanitize_key( $value );
					break;

				case 'order':
					$order          = strtoupper( $value );
					$clean['order'] = in_array( $order, [ 'ASC', 'DESC' ], true ) ? $order : 'DESC';
					break;

				case 'taxonomy':
					if ( taxonomy_exists( $value ) ) {
						$clean['taxonomy'] = sanitize_key( $value );
					}
					break;

				case 'term':
					$clean['term'] = (int) $value;
					break;

				case 'include':
				case 'post__in':
					$clean['post__in'] = array_map( 'intval', (array) $value );
					break;

				case 'exclude':
				case 'post__not_in':
					$clean['post__not_in'] = array_map( 'intval', (array) $value );
					break;

				case 'loopTerms':
					$clean['loopTerms'] = filter_var( $value, FILTER_VALIDATE_BOOLEAN );
					break;
			}
		}

		return $clean;
	}


	private function build_query_args( array $q, int $page ): array {
		$args = [
			'post_type'      => $q['post_type'] ?? 'post',
			'post_status'    => 'publish',
			'posts_per_page' => $q['posts_per_page'] ?? 12,
			'paged'          => $page,
		];

		if ( ! empty( $q['orderby'] ) ) {
			$args['orderby'] = $q['orderby'];
		}
		if ( ! empty( $q['order'] ) ) {
			$args['order'] = $q['order'];
		}

		if ( ! empty( $q['taxonomy'] ) && ! empty( $q['term'] ) ) {
			$args['tax_query'] = [
				[
					'taxonomy' => $q['taxonomy'],
					'field'    => 'term_id',
					'terms'    => intval( $q['term'] ),
				]
			];
		}

		if ( ! empty( $q['post__in'] ) ) {
			$args['post__in'] = $q['post__in'];
		}
		if ( ! empty( $q['post__not_in'] ) ) {
			$args['post__not_in'] = $q['post__not_in'];
		}

		return $args;
	}


	private function error( string $msg, int $code = 400 ): WP_REST_Response {
		return new WP_REST_Response( [ 'error' => $msg ], $code );
	}

}
