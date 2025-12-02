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

	/*───────────────────────────────────────────────────────────────
		REST ENDPOINT
	───────────────────────────────────────────────────────────────*/
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

	/*───────────────────────────────────────────────────────────────
		REQUEST HANDLER
	───────────────────────────────────────────────────────────────*/
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

		$query = $this->sanitize_query( $query_raw );

		// run SSR
		$output = $this->render_loop( $template, $query, $page );

		return rest_ensure_response( $output );
	}


	/*───────────────────────────────────────────────────────────────
		MAIN LOOP RENDERING
	───────────────────────────────────────────────────────────────*/
	/*───────────────────────────────────────────────────────────────
		MAIN LOOP RENDERING
	───────────────────────────────────────────────────────────────*/
	private function render_loop( array $template_block, array $query, int $page ): array {

		$html  = '';
		$index = 0;

		/*
		 * ===============================================================
		 * 1. TAXONOMY LOOP MODE (loopTerms = true)
		 * ===============================================================
		 */
		if ( ! empty( $query['loopTerms'] ) && ! empty( $query['taxonomy'] ) ) {

			$taxonomy = sanitize_key( $query['taxonomy'] );

			// Fetch all non-empty terms (can switch to hide_empty = false if needed)
			$terms = get_terms( [
				'taxonomy'   => $taxonomy,
				'hide_empty' => true,
			] );

			if ( is_wp_error( $terms ) ) {
				return [
					'html'  => '',
					'total' => 0,
					'pages' => 1,
					'page'  => 1,
				];
			}

			$html  = '';
			$index = 0;

			foreach ( $terms as $term ) {
				$html .= $this->render_card_from_ast(
					$template_block,
					$query,
					null,              // post_id = null
					$index,
					$term->term_id     // ⭐ pass termId
				);
				$index ++;
			}

			return [
				'html'   => $html,
				'total'  => count( $terms ),
				'pages'  => 1,
				'page'   => 1,
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
			if ( ! ( $wp_query instanceof WP_Query ) ) {
				return [
					'html'  => '',
					'total' => 0,
					'pages' => 1,
					'page'  => 1,
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
		?int $term_id = null
	): string {

		$block = $template;

		$block['innerBlocks'] = $template['innerBlocks'] ?? [];

		if ( $post_id !== null ) {
			$block['attrs']['postId'] = $post_id;
		}

		if ( $term_id !== null ) {
			$block['attrs']['termId'] = $term_id;
		}

		$block['attrs']['index'] = $index;

		$taxonomy = $query['taxonomy'] ?? null;

		$context = [
			'postId'   => $post_id,
			'termId'   => $term_id,
			'taxonomy' => $taxonomy,

			'wpbs/postId'   => $post_id,
			'wpbs/termId'   => $term_id,
			'wpbs/taxonomy' => $taxonomy,
			'wpbs/index'    => $index,
		];

		$instance = new WP_Block( $block, $context );

		$instance->context['termId'] = $term_id;

		return $instance->render();
	}


	/*───────────────────────────────────────────────────────────────
		SANITIZATION, QUERY BUILDING, ERRORS (UNCHANGED)
	───────────────────────────────────────────────────────────────*/

	private function sanitize_query( array $q ): array {
		$clean = [];

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

		if ( isset( $q['posts_per_page'] ) ) {
			$clean['posts_per_page'] = max( - 1, (int) $q['posts_per_page'] );
		}

		if ( ! empty( $q['taxonomy'] ) && taxonomy_exists( $q['taxonomy'] ) ) {
			$clean['taxonomy'] = sanitize_key( $q['taxonomy'] );
		}

		if ( ! empty( $q['term'] ) ) {
			$clean['term'] = (int) $q['term'];
		}

		if ( ! empty( $q['orderby'] ) ) {
			$clean['orderby'] = sanitize_key( $q['orderby'] );
		}

		if ( ! empty( $q['order'] ) ) {
			$order          = strtoupper( $q['order'] );
			$clean['order'] = in_array( $order, [ 'ASC', 'DESC' ], true ) ? $order : 'DESC';
		}

		if ( ! empty( $q['include'] ) ) {
			$clean['post__in'] = array_map( 'intval', (array) $q['include'] );
		}

		if ( ! empty( $q['exclude'] ) ) {
			$clean['post__not_in'] = array_map( 'intval', (array) $q['exclude'] );
		}

		// ⭐ Preserve loopTerms flag (even if it's falsey-ish like "false"/"0")
		if ( array_key_exists( 'loopTerms', $q ) ) {
			// FILTER_VALIDATE_BOOLEAN handles "true"/"false"/1/0/"1"/"0"
			$clean['loopTerms'] = filter_var( $q['loopTerms'], FILTER_VALIDATE_BOOLEAN );
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
