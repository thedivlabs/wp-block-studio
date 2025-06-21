<?php

class WPBS_Grid {

	private static WPBS_Grid $instance;

	private function __construct() {

		add_action( 'rest_api_init', function () {
			register_rest_route( 'wpbs/v1', "/layout-grid/",
				[
					'methods'             => 'POST',
					'accept_json'         => true,
					'callback'            => [ $this, 'rest_request' ],
					'permission_callback' => function () {
						$nonce = $_SERVER['HTTP_X_WP_NONCE'] ?? null;

						return $nonce && wp_verify_nonce( $nonce, 'wp_rest' );
					},
					'args'                => [
						'page'  => [
							'type'              => 'integer',
							'default'           => 1,
							'sanitize_callback' => 'absint',
						],
						'card'  => [
							'type'              => 'object',
							'sanitize_callback' => [ 'WPBS', 'sanitize_block_template' ],
						],
						'query' => [
							'type'              => 'array',
							'sanitize_callback' => [ 'WPBS', 'sanitize_query_args' ],
						],
						'terms' => [
							'type'              => 'array',
							'sanitize_callback' => function ( $value ) {
								if ( ! is_array( $value ) ) {
									return [];
								}

								return array_values( array_filter( array_map( 'absint', $value ) ) );
							},
						],
					],
				]
			);
		} );


	}

	public static function pagination( $query ): string|bool {

		if ( ! is_a( $query, 'WP_Query' ) ) {
			return false;
		}

		$big = 999999999;

		$current_page = max( 1, get_query_var( 'paged' ) );

		$base = str_replace( $big, '%#%', esc_url( get_pagenum_link( $big ) ) );

		$pagination_links = array_map( function ( $link ) use ( $current_page ) {
			return str_replace( [ '<span', '</span>', 'current' ], [
				'<button type="button" disabled',
				'</button>',
				'current wp-element-button ',
			], $link );
		}, paginate_links( [
			'base'      => $base,
			'format'    => '/page/%#%/',
			'current'   => $current_page,
			'total'     => $query->max_num_pages,
			'prev_next' => false,
			'mid_size'  => 6,
			'type'      => 'array',
		] ) );

		if ( ! empty( $pagination_links ) ) {
			do_blocks( '<!-- wp:query-pagination --><!-- wp:query-pagination-previous /--><!-- wp:query-pagination-numbers {"className":"inline-flex w-max"}  /--><!-- wp:query-pagination-next /--><!-- /wp:query-pagination -->' );

			return implode( ' ', [
				'<nav class="wp-block-query-pagination mt-8" aria-label="Pagination">',
				'<div class="wp-block-query-pagination-numbers inline-flex w-max">' . implode( '', $pagination_links ) . '</div>',
				'</nav>'
			] );
		} else {
			return false;
		}


	}


	public static function render_loop( $card = [], $query = [], $page = 1 ): array|bool {

		if ( empty( $card ) ) {
			return [];
		}

		$new_content = '';
		$css         = '';

		$query = WPBS::loop_query( $query, $page );

		$is_last = is_a( $query, 'WP_Query' ) && $page >= ( $query->max_num_pages ?? 1 ) || is_array( $query );

		if ( is_a( $query, 'WP_Query' ) && $query->have_posts() ) {

			$query_counter = 0;

			while ( $query->have_posts() ) {

				$query->the_post();

				$new_block = WPBS::loop_card( $card, [
					'postId' => get_the_id(),
				], $query_counter );

				$query_counter ++;

				$new_content .= $new_block->render();
				$css         .= $new_block->attributes['wpbs-css'] ?? '';

			}

			wp_reset_postdata();

			return array_filter( [
				'content' => ! empty( $new_content ) ? $new_content : false,
				'css'     => trim( $css ),
				'last'    => $is_last,
				'query'   => $query
			] );
		}

		if ( is_array( $query ) ) {

			foreach ( $query as $k => $term_id ) {

				$term = get_term( $term_id );

				if ( ! is_a( $term, 'WP_Term' ) ) {
					continue;
				}

				$new_block = WPBS::loop_card( $card, [
					'termId' => $term->term_id,
				], $k );

				$css         .= $new_block->attributes['wpbs-css'] ?? '';
				$new_content .= $new_block->render();

			}

		}

		return array_filter( [
			'content' => $new_content,
			'css'     => $css,
			'last'    => $is_last,
			'query'   => $query
		] );

	}

	public function rest_request( WP_REST_Request $request ): WP_REST_Response|WP_Error {

		$card  = $request->get_param( 'card' );
		$query = $request->get_param( 'query' );
		$page  = $request->get_param( 'page' );

		$result = self::render_loop( $card, $query, intval( $page ) );

		return new WP_REST_Response(
			array_filter( [
				'status'  => 200,
				'content' => $result['content'] ?? null,
				'css'     => $result['css'] ?? null,
				'last'    => $result['last'] ?? null,
			] )
		);

	}

	public static function init(): WPBS_Grid {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Grid();
		}

		return self::$instance;
	}

}


