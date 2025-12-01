<?php
declare(strict_types=1);

class WPBS_Loop {

	private static WPBS_Loop $instance;

	/**
	 * Singleton initializer
	 */
	public static function init(): WPBS_Loop {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Loop();
		}
		return self::$instance;
	}

	/**
	 * Private constructor — registers endpoint
	 */
	private function __construct() {
		add_action( 'rest_api_init', [ $this, 'register_endpoint' ] );
	}

	/*───────────────────────────────────────────────────────────────
		REST ENDPOINT REGISTRATION
	───────────────────────────────────────────────────────────────*/

	public function register_endpoint(): void {

		register_rest_route(
			'wpbs/v1',
			'/loop',
			[
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => [ $this, 'handle_request' ],
				'permission_callback' => [ $this, 'permissions' ],
				'args'                => $this->get_allowed_args(),
			]
		);
	}

	public function permissions(): bool {
		// Public endpoint for now; restrict if needed later.
		return true;
	}

	private function get_allowed_args(): array {
		return [
			'template' => [
				'type'        => 'string',
				'required'    => true,
				'description' => 'HTML markup for the Loop Card block.',
			],
			'query' => [
				'type'        => 'object',
				'required'    => true,
				'description' => 'Editor-generated query settings.',
			],
			'page' => [
				'type'     => 'integer',
				'default'  => 1,
			],
		];
	}

	/*───────────────────────────────────────────────────────────────
		MAIN REST API HANDLER
	───────────────────────────────────────────────────────────────*/

	public function handle_request( WP_REST_Request $request ): WP_REST_Response {

		$template  = $request->get_param( 'template' );
		$query_raw = $request->get_param( 'query' );
		$page      = max( 1, intval( $request->get_param( 'page' ) ?? 1 ) );

		if ( empty( $template ) || ! is_string( $template ) ) {
			return $this->error( 'Invalid template.' );
		}

		if ( ! is_array( $query_raw ) ) {
			return $this->error( 'Query must be an object.' );
		}

		// Sanitize all query settings
		$query = $this->sanitize_query( $query_raw );

		// Run SSR loop
		$output = $this->render_loop( $template, $query, $page );

		return rest_ensure_response( $output );
	}

	/*───────────────────────────────────────────────────────────────
		QUERY SANITIZATION
	───────────────────────────────────────────────────────────────*/

	private function sanitize_query( array $q ): array {

		$clean = [];

		// post_type (supports "current")
		$public_pts = get_post_types( [ 'public' => true ], 'names' );

		if ( isset( $q['post_type'] ) ) {
			$pt = sanitize_key( $q['post_type'] );

			if ( $pt === 'current' ) {
				$clean['post_type'] = 'current';
			} elseif ( in_array( $pt, $public_pts, true ) ) {
				$clean['post_type'] = $pt;
			} else {
				$clean['post_type'] = 'post';
			}
		}

		// posts_per_page
		if ( isset( $q['posts_per_page'] ) ) {
			$clean['posts_per_page'] = max( -1, intval( $q['posts_per_page'] ) );
		}

		// loop_terms (term loop mode)
		if ( ! empty( $q['loop_terms'] ) ) {
			$clean['loop_terms'] = (bool) $q['loop_terms'];
		}

		// taxonomy
		if ( ! empty( $q['taxonomy'] ) ) {
			$tax = sanitize_key( $q['taxonomy'] );
			if ( taxonomy_exists( $tax ) ) {
				$clean['taxonomy'] = $tax;
			}
		}

		// term (supports single, array, or "current")
		if ( array_key_exists( 'term', $q ) ) {

			// explicit "current" term marker
			if ( $q['term'] === 'current' ) {
				$clean['term'] = 'current';
			} elseif ( is_array( $q['term'] ) ) {
				$clean['term'] = array_map( 'intval', $q['term'] );
			} elseif ( $q['term'] !== null && $q['term'] !== '' ) {
				$clean['term'] = [ intval( $q['term'] ) ];
			}
		}

		// orderby (whitelist)
		if ( ! empty( $q['orderby'] ) ) {
			$allowed_orderby = [
				'date',
				'title',
				'menu_order',
				'modified',
				'ID',
				'name',
				'author',
				'rand',
			];

			$ob = sanitize_key( $q['orderby'] );

			$clean['orderby'] = in_array( $ob, $allowed_orderby, true ) ? $ob : 'date';
		}

		// order
		if ( ! empty( $q['order'] ) ) {
			$order          = strtoupper( (string) $q['order'] );
			$clean['order'] = in_array( $order, [ 'ASC', 'DESC' ], true ) ? $order : 'DESC';
		}

		// include / exclude
		if ( ! empty( $q['include'] ) && is_array( $q['include'] ) ) {
			$clean['post__in'] = array_map( 'intval', $q['include'] );
		}
		if ( ! empty( $q['exclude'] ) && is_array( $q['exclude'] ) ) {
			$clean['post__not_in'] = array_map( 'intval', $q['exclude'] );
		}

		return $clean;
	}

	/*───────────────────────────────────────────────────────────────
		MAIN LOOP RENDERING
	───────────────────────────────────────────────────────────────*/

	private function render_loop( string $template_html, array $query, int $page ): array {

		$template_blocks = parse_blocks( $template_html );

		// TERM LOOP MODE
		if ( ! empty( $query['loop_terms'] ) && ! empty( $query['taxonomy'] ) ) {

			$terms = $this->get_terms_for_query( $query );

			$html = '';

			foreach ( $terms as $term ) {
				if ( ! $term instanceof WP_Term ) {
					continue;
				}

				$html .= $this->render_card( $template_blocks, null, $term->term_id );
			}

			$total = count( $terms );

			return [
				'html'  => $html,
				'total' => $total,
				// For now, term loops are treated as a single "page".
				'pages' => 1,
				'page'  => 1,
			];
		}

		// POST LOOP MODE
		$args = $this->build_query_args( $query, $page );

		$wpq = new WP_Query( $args );

		$total = intval( $wpq->found_posts );
		$pages = $args['posts_per_page'] > 0
			? max( 1, (int) ceil( $total / $args['posts_per_page'] ) )
			: 1;

		$html = '';

		while ( $wpq->have_posts() ) {
			$wpq->the_post();
			$post_id = get_the_ID();

			$html .= $this->render_card( $template_blocks, $post_id, null );
		}
		wp_reset_postdata();

		return [
			'html'  => $html,
			'total' => $total,
			'pages' => $pages,
			'page'  => $page,
		];
	}

	/*───────────────────────────────────────────────────────────────
		TERM QUERY ARG BUILDER
	───────────────────────────────────────────────────────────────*/

	private function get_terms_for_query( array $q ): array {

		$args = [
			'taxonomy'   => $q['taxonomy'],
			'hide_empty' => true,
		];

		// If "term" is an explicit list of IDs
		if ( ! empty( $q['term'] ) && is_array( $q['term'] ) && $q['term'] !== 'current' ) {
			$args['include'] = array_map( 'intval', $q['term'] );
		}

		if ( ! empty( $q['orderby'] ) ) {
			$args['orderby'] = $q['orderby'];
		}
		if ( ! empty( $q['order'] ) ) {
			$args['order'] = $q['order'];
		}

		return get_terms( $args );
	}

	/*───────────────────────────────────────────────────────────────
		QUERY ARG BUILDER (supports "current")
	───────────────────────────────────────────────────────────────*/

	private function build_query_args( array $q, int $page ): array {

		// Special “current” mode
		if ( ( $q['post_type'] ?? '' ) === 'current' ) {

			$queried = get_queried_object();

			// Singular post/page
			if ( $id = get_queried_object_id() ) {
				return [
					'post_type'      => 'any',
					'post_status'    => 'publish',
					'p'              => $id,
					'posts_per_page' => 1,
					'paged'          => 1,
				];
			}

			// Term archive
			if ( $queried instanceof WP_Term ) {
				return [
					'post_type'      => 'any',
					'post_status'    => 'publish',
					'posts_per_page' => $q['posts_per_page'] ?? 12,
					'paged'          => $page,
					'tax_query'      => [
						[
							'taxonomy' => $queried->taxonomy,
							'field'    => 'term_id',
							'terms'    => [ $queried->term_id ],
						],
					],
				];
			}
		}

		// Normal mode
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

		// Tax query (supports array of terms, and "current" via sanitize_query)
		if ( ! empty( $q['taxonomy'] ) && ! empty( $q['term'] ) ) {

			$terms = $q['term'];

			if ( $terms === 'current' ) {
				$queried = get_queried_object();
				if ( $queried instanceof WP_Term ) {
					$terms = [ $queried->term_id ];
				} else {
					$terms = [];
				}
			}

			if ( ! is_array( $terms ) ) {
				$terms = [ intval( $terms ) ];
			}

			$args['tax_query'] = [
				[
					'taxonomy' => $q['taxonomy'],
					'field'    => 'term_id',
					'terms'    => array_map( 'intval', $terms ),
					'operator' => 'IN',
				],
			];
		}

		if ( ! empty( $q['post__in'] ) ) {
			$args['post__in'] = array_map( 'intval', $q['post__in'] );
		}

		if ( ! empty( $q['post__not_in'] ) ) {
			$args['post__not_in'] = array_map( 'intval', $q['post__not_in'] );
		}

		return $args;
	}

	/*───────────────────────────────────────────────────────────────
		CARD RENDERING
	───────────────────────────────────────────────────────────────*/

	private function render_card(string $template_html, int $post_id): string {

		// Parse blocks fresh each render — safe and correct
		$blocks = parse_blocks($template_html);

		// We expect ONE top-level block (your Loop Card block)
		$card = $blocks[0] ?? null;
		if (!$card) return '';

		// Ensure attributes exist
		if (!isset($card['attrs'])) {
			$card['attrs'] = [];
		}

		// This is CRITICAL — let block.json propagate context
		$card['attrs']['postId'] = $post_id;

		// Add context for children
		$card['context'] = array_merge(
			$card['context'] ?? [],
			['wpbs/postId' => $post_id]
		);

		// Allow the loop card to render inner blocks with correct context
		return render_block($card);
	}

	/*───────────────────────────────────────────────────────────────
		ERROR HELPERS
	───────────────────────────────────────────────────────────────*/

	private function error( string $msg, int $code = 400 ): WP_REST_Response {
		return new WP_REST_Response( [ 'error' => $msg ], $code );
	}
}