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
		return true; // public endpoint — tighten if needed
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

		$template = $request->get_param( 'template' );
		$query_raw = $request->get_param( 'query' );
		$page = max( 1, intval( $request->get_param( 'page' ) ?? 1 ) );

		if ( empty($template) || ! is_string($template) ) {
			return $this->error('Invalid template.');
		}

		if ( ! is_array( $query_raw ) ) {
			return $this->error('Query must be an object.');
		}

		// sanitize all query settings
		$query = $this->sanitize_query( $query_raw );

		// run SSR loop
		$output = $this->render_loop( $template, $query, $page );

		return rest_ensure_response( $output );
	}



	/*───────────────────────────────────────────────────────────────
		QUERY SANITIZATION
	───────────────────────────────────────────────────────────────*/

	private function sanitize_query( array $q ): array {

		$clean = [];

		// post_type (supports "current")
		$public_pts = get_post_types([ 'public' => true ], 'names');

		if ( isset( $q['post_type'] ) ) {
			$pt = sanitize_key($q['post_type']);

			if ( $pt === 'current' ) {
				$clean['post_type'] = 'current';
			}
			elseif ( in_array($pt, $public_pts, true) ) {
				$clean['post_type'] = $pt;
			}
			else {
				$clean['post_type'] = 'post';
			}
		}

		// posts_per_page
		if ( isset($q['posts_per_page']) ) {
			$clean['posts_per_page'] = max(-1, intval($q['posts_per_page']));
		}

		// taxonomy
		if ( ! empty($q['taxonomy']) ) {
			$tax = sanitize_key($q['taxonomy']);
			if ( taxonomy_exists($tax) ) {
				$clean['taxonomy'] = $tax;
			}
		}

		// term
		if ( ! empty($q['term']) ) {
			$clean['term'] = intval($q['term']);
		}

		// orderby
		if ( ! empty($q['orderby']) ) {
			$clean['orderby'] = sanitize_key($q['orderby']);
		}

		// order
		if ( ! empty($q['order']) ) {
			$order = strtoupper($q['order']);
			$clean['order'] = in_array($order, ['ASC', 'DESC'], true) ? $order : 'DESC';
		}

		// include / exclude
		if ( ! empty($q['post__in']) && is_array($q['post__in']) ) {
			$clean['post__in'] = array_map('intval', $q['post__in']);
		}
		if ( ! empty($q['post__not_in']) && is_array($q['post__not_in']) ) {
			$clean['post__not_in'] = array_map('intval', $q['post__not_in']);
		}

		return $clean;
	}



	/*───────────────────────────────────────────────────────────────
		MAIN LOOP RENDERING
	───────────────────────────────────────────────────────────────*/

	private function render_loop( string $template_html, array $query, int $page ): array {

		$template_blocks = parse_blocks( $template_html );

		// Build WP_Query args
		$args = $this->build_query_args( $query, $page );

		$wpq = new WP_Query( $args );

		$total = intval($wpq->found_posts);
		$pages = $args['posts_per_page'] > 0
			? max(1, (int) ceil($total / $args['posts_per_page']))
			: 1;

		$html = '';

		// Loop through posts
		while ( $wpq->have_posts() ) {
			$wpq->the_post();
			$post_id = get_the_ID();

			$html .= $this->render_card( $template_blocks, $post_id );
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
		QUERY ARG BUILDER (supports "current")
	───────────────────────────────────────────────────────────────*/

	private function build_query_args( array $q, int $page ): array {

		// special “current” mode
		if ( ($q['post_type'] ?? '') === 'current' ) {

			$queried = get_queried_object();

			// singular post/page
			if ( $id = get_queried_object_id() ) {
				return [
					'post_type'      => 'any',
					'post_status'    => 'publish',
					'p'              => $id,
					'posts_per_page' => 1,
					'paged'          => 1,
				];
			}

			// term archive
			if ( $queried instanceof WP_Term ) {
				return [
					'post_type'      => 'any',
					'post_status'    => 'publish',
					'posts_per_page' => $q['posts_per_page'] ?? 12,
					'paged'          => $page,
					'tax_query'      => [[
						'taxonomy' => $queried->taxonomy,
						'field'    => 'term_id',
						'terms'    => [$queried->term_id],
					]],
				];
			}
		}

		// normal mode
		$args = [
			'post_type'      => $q['post_type'] ?? 'post',
			'post_status'    => 'publish',
			'posts_per_page' => $q['posts_per_page'] ?? 12,
			'paged'          => $page,
		];

		if (!empty($q['orderby'])) $args['orderby'] = $q['orderby'];
		if (!empty($q['order']))   $args['order'] = $q['order'];

		if (!empty($q['taxonomy']) && !empty($q['term'])) {
			$args['tax_query'] = [[
				'taxonomy' => $q['taxonomy'],
				'field'    => 'term_id',
				'terms'    => intval($q['term']),
			]];
		}

		if (!empty($q['post__in']))     $args['post__in'] = $q['post__in'];
		if (!empty($q['post__not_in'])) $args['post__not_in'] = $q['post__not_in'];

		return $args;
	}



	/*───────────────────────────────────────────────────────────────
		CARD RENDERING
	───────────────────────────────────────────────────────────────*/

	private function render_card( array $blocks, int $post_id ): string {

		$output = '';

		foreach ( $blocks as $block ) {

			$context = array_merge(
				$block['context'] ?? [],
				['wpbs/postId' => $post_id]
			);

			$b = $block;
			$b['context'] = $context;

			$output .= render_block( $b );
		}

		return $output;
	}



	/*───────────────────────────────────────────────────────────────
		ERROR HELPERS
	───────────────────────────────────────────────────────────────*/

	private function error( string $msg, int $code = 400 ): WP_REST_Response {
		return new WP_REST_Response([ 'error' => $msg ], $code);
	}

}