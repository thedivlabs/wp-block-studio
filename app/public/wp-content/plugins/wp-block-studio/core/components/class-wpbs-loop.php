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
	 * ------------------------------------------------------------------
	 * Unified build() — single call that:
	 * - sanitizes template + query
	 * - renders SSR HTML
	 * - generates hydration script
	 * - returns everything in one array
	 * ------------------------------------------------------------------
	 */
	public static function build( array $template, array $query = [], int $page = 1 ): array {
		if ( empty( $template['blockName'] ) ) {
			return [
				'html'  => '',
				'total' => 0,
				'pages' => 1,
				'page'  => 1,
				'error' => 'Invalid template passed to build().',
			];
		}

		// Sanitize template + query
		$sanitized_template = self::sanitize_block_template( $template );
		$clean_query        = self::sanitize_query( $query );
		$page               = max( 1, $page );

		// Render the loop (SSR)
		$loop_data = self::render_loop( $sanitized_template, $clean_query, $page );

		// Build hydration script
		$script = self::generate_script_tag(
			$sanitized_template,
			$loop_data,
			$clean_query,
			$page
		);

		// Return one unified array
		return array_merge(
			$loop_data,
			[
				'template' => $sanitized_template,
				'query'    => $clean_query,
				'script'   => $script,
			]
		);
	}

	/**
	 * ------------------------------------------------------------------
	 * Generates hydration script but does NOT echo it.
	 * Returned as a <script> tag string.
	 * ------------------------------------------------------------------
	 */
	private static function generate_script_tag( array $template, array $loop_data, array $query, int $page ): string {
		$query_clean = WPBS::clean_array( $query );

		$template_json = wp_json_encode(
			$template,
			JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
		);

		$pagination_json = wp_json_encode(
			[
				'page'       => max( 1, $page ),
				'totalPages' => $loop_data['pages'] ?? 1,
				'totalPosts' => $loop_data['total'] ?? 0,
				'query'      => $query_clean,
			],
			JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
		);

		return '<script type="application/json" data-wpbs-loop-template>' .
		       json_encode(
			       [
				       'template'   => json_decode( $template_json, true ),
				       'pagination' => json_decode( $pagination_json, true ),
			       ],
			       JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
		       )
		       . '</script>';
	}

	/**
	 * ------------------------------------------------------------------
	 * REST endpoint registration
	 * ------------------------------------------------------------------
	 */
	public function register_endpoint(): void {
		register_rest_route( 'wpbs/v1', '/loop', [
			'methods'             => \WP_REST_Server::CREATABLE,
			'callback'            => [ $this, 'handle_request' ],
			'permission_callback' => '__return_true',
			'args'                => [
				'template' => [ 'type' => 'object', 'required' => true ],
				'query'    => [ 'type' => 'object', 'required' => true ],
				'page'     => [ 'type' => 'integer', 'default' => 1 ],
			],
		] );
	}

	/**
	 * ------------------------------------------------------------------
	 * REST handler — uses same internal logic as build()
	 * ------------------------------------------------------------------
	 */
	public function handle_request( WP_REST_Request $request ): WP_REST_Response {
		$template  = $request->get_param( 'template' );
		$query_raw = $request->get_param( 'query' );
		$page      = max( 1, intval( $request->get_param( 'page' ) ?? 1 ) );

		if ( ! is_array( $template ) || empty( $template['blockName'] ) ) {
			return $this->error( 'Invalid template.' );
		}

		if ( ! is_array( $query_raw ) ) {
			return $this->error( 'Invalid query.' );
		}

		return rest_ensure_response(
			self::build(
				self::sanitize_block_template( $template ),
				self::sanitize_query( $query_raw ),
				$page
			)
		);
	}

	/**
	 * ------------------------------------------------------------------
	 * Sanitization for block AST sent from editor → REST → PHP
	 * ------------------------------------------------------------------
	 */
	public static function sanitize_block_template( $block, &$counter = 0, int $max_blocks = 30 ): array {

		// Guard: must be array
		if ( ! is_array( $block ) ) {
			return [];
		}

		// Block limit safety
		if ( ++ $counter > $max_blocks ) {
			return [];
		}

		// Sanitize attrs (deep recursive)
		$attrs = [];
		if ( ! empty( $block['attrs'] ) && is_array( $block['attrs'] ) ) {
			$attrs = self::recursive_sanitize( $block['attrs'] );
		}

		// Sanitize innerBlocks
		$inner_blocks = [];
		if ( ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
			foreach ( $block['innerBlocks'] as $inner ) {
				$inner_blocks[] = self::sanitize_block_template( $inner, $counter, $max_blocks );
			}
		}

		// Sanitize innerContent (must preserve nulls)
		$inner_content = [];
		if ( isset( $block['innerContent'] ) && is_array( $block['innerContent'] ) ) {
			foreach ( $block['innerContent'] as $item ) {
				if ( is_string( $item ) ) {
					$inner_content[] = wp_kses_post( $item );
				} else {
					// Gutenberg uses null placeholders for block boundaries
					$inner_content[] = null;
				}
			}
		}

		return [
			'blockName'    => isset( $block['blockName'] ) ? sanitize_text_field( $block['blockName'] ) : '',
			'attrs'        => $attrs,
			'innerBlocks'  => $inner_blocks,
			'innerHTML'    => isset( $block['innerHTML'] ) ? wp_kses_post( $block['innerHTML'] ) : '',
			'innerContent' => $inner_content,
		];
	}

	public static function recursive_sanitize( $input ) {

		// -------------------------------------
		// 1. ARRAY → sanitize keys + recurse
		// -------------------------------------
		if ( is_array( $input ) ) {
			$sanitized = [];

			foreach ( $input as $key => $value ) {

				// Preserve casing, allow only safe key characters
				// Allowed: A-Z a-z 0-9 _ - /
				if ( is_string( $key ) ) {
					$clean_key = preg_replace( '/[^A-Za-z0-9_\-\/]/', '', $key );
				} else {
					$clean_key = $key;
				}

				$sanitized[ $clean_key ] = self::recursive_sanitize( $value );
			}

			return $sanitized;
		}

		// -------------------------------------
		// 2. STRING → specialized whitelist
		// -------------------------------------
		if ( is_string( $input ) ) {

			$trimmed = trim( $input );

			// Allow Gutenberg CSS variable tokens exactly as-is.
			// Example: var:preset|color|pale-pink
			if ( str_starts_with( $trimmed, 'var:' ) ) {
				return $trimmed;
			}

			// Allow rgb(), rgba(), hsl(), hsla() color syntax
			if ( preg_match( '/^(rgb|rgba|hsl|hsla)\(/i', $trimmed ) ) {
				return $trimmed;
			}

			// Allow safe CSS numeric values and keywords.
			// Examples: 24px, 2rem, 50%, auto, bold, center
			if ( preg_match( '/^[A-Za-z0-9 ._%\-]+$/', $trimmed ) ) {
				return $trimmed;
			}

			// Final fallback: clean normal text
			return sanitize_text_field( $trimmed );
		}

		// -------------------------------------
		// 3. Safe primitives
		// -------------------------------------
		if ( is_int( $input ) ) {
			return $input;
		}

		if ( is_float( $input ) ) {
			return $input;
		}

		if ( is_bool( $input ) ) {
			return $input;
		}

		if ( is_null( $input ) ) {
			return null;
		}

		// -------------------------------------
		// 4. Fallback (objects, unexpected types)
		// -------------------------------------
		return $input;
	}

	/**
	 * ------------------------------------------------------------------
	 * Main loop rendering logic (unchanged except static context)
	 * ------------------------------------------------------------------
	 */
	private static function render_loop( array $template_block, array $query, int $page ): array {

		$html  = '';
		$index = 0;

		/*
 * ===============================================================
 * 0. MEDIA GALLERY LOOP MODE (gallery object passed)
 * ===============================================================
 */

		if ( ! empty( $query['gallery_id'] ) ) {

			$gallery_id = intval( $query['gallery_id'] );

			$acf = get_field( 'wpbs', $gallery_id );

			if ( empty( $acf ) || ! is_array( $acf ) ) {
				return [
					'html'     => '',
					'total'    => 0,
					'pages'    => 1,
					'page'     => $page,
					'lightbox' => [
						'media'    => [],
						'settings' => $query,
					],
				];
			}

			$images = ! empty( $acf['images'] ) && is_array( $acf['images'] ) ? $acf['images'] : [];
			$videos = ! empty( $acf['video'] ) && is_array( $acf['video'] ) ? $acf['video'] : [];

			// Full merged list (not paginated)
			$merged = ! empty( $query['video_first'] )
				? array_values( array_merge( $videos, $images ) )
				: array_values( array_merge( $images, $videos ) );

			if ( empty( $merged ) ) {
				return [
					'html'     => '',
					'total'    => 0,
					'pages'    => 1,
					'page'     => $page,
					'lightbox' => [
						'media'    => [],
						'settings' => $query,
					],
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
				$html .= self::render_card_from_ast(
					$template_block,
					$query,
					null,
					$index,
					null,
					$media
				);
				$index ++;
			}

			return [
				'html'     => $html,
				'total'    => $total_items,
				'pages'    => $total_pages,
				'page'     => $page,
				'query'    => $query,

				// ⭐ NEW: unified lightbox payload
				'lightbox' => [
					'media'    => $merged,  // full gallery array, unpaginated
					'settings' => $query,   // includes eager/lightbox/resolution/video_first/etc
				],
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
				$html .= self::render_card_from_ast(
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

				$html .= self::render_card_from_ast(
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
		$args = self::build_query_args( $query, $page );

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

			$html .= self::render_card_from_ast(
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

	private static function sanitize_query( array $q ): array {
		global $wp_query;

		$clean = [];

		// ------------------------------------
		// Allowed loop keys (WP_Query related)
		// ------------------------------------
		$allowed_loop = [
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

		// ------------------------------------
		// Allowed gallery keys (NOT WP_Query)
		// These are passed to the block renderer only
		// ------------------------------------
		$allowed_gallery = [
			'gallery_id',
			'page_size',
			'lightbox',
			'eager',
			'video_first',
			'resolution',
		];

		$allowed = array_merge( $allowed_loop, $allowed_gallery );

		// ------------------------------------
		// Forbidden unsafe patterns
		// ------------------------------------
		$forbidden_patterns = [
			'/request/i',
			'/sql/i',
			'/meta_query/i',
			'/meta_key/i',
			'/meta_value/i',
			'/cache/i',
			'/suppress_filters/i',
			'/tax_query/i',
		];

		foreach ( $q as $key => $value ) {
			// Reject unsafe keys
			foreach ( $forbidden_patterns as $pattern ) {
				if ( preg_match( $pattern, $key ) ) {
					continue 2;
				}
			}

			// Reject keys not in our unified whitelist
			if ( ! in_array( $key, $allowed, true ) ) {
				continue;
			}

			// ------------------------------------------------
			// LOOP QUERY SANITIZATION
			// ------------------------------------------------
			switch ( $key ) {

				case 'post_type':
					$pt = sanitize_key( $value );

					if ( $pt === 'current' ) {
						$clean['post_type']      = 'current';
						$clean['posts_per_page'] = (int) get_option( 'posts_per_page', 10 );
					} else {
						$public             = get_post_types( [ 'public' => true ], 'names' );
						$clean['post_type'] = in_array( $pt, $public, true ) ? $pt : 'post';
					}
					break;

				case 'posts_per_page':
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


				// ------------------------------------------------
				// GALLERY QUERY SANITIZATION
				// ------------------------------------------------
				case 'gallery_id':
					$clean['gallery_id'] = max( 0, (int) $value );
					break;

				case 'page_size':
					$clean['page_size'] = max( 1, (int) $value );
					break;

				case 'lightbox':
				case 'eager':
				case 'video_first':
					$clean[ $key ] = filter_var( $value, FILTER_VALIDATE_BOOLEAN );
					break;

				case 'resolution':
					// whitelist resolutions you support
					$allowed_res         = [ 'small', 'medium', 'large', 'full' ];
					$res                 = sanitize_key( $value );
					$clean['resolution'] = in_array( $res, $allowed_res, true ) ? $res : 'large';
					break;
			}
		}

		return $clean;
	}

	private static function render_card_from_ast(
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

			'wpbs/query'    => $query,
			'wpbs/media'    => $media,
			'wpbs/postId'   => $post_id,
			'wpbs/termId'   => $term_id,
			'wpbs/taxonomy' => $taxonomy,
			'wpbs/index'    => $index,
		];

		$instance = new WP_Block( $block, $context );

		$instance->context['postId'] = $post_id;
		$instance->context['termId'] = $term_id;
		$instance->context['media']  = $media;

		return $instance->render();
	}


	private static function build_query_args( array $q, int $page ): array {
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
