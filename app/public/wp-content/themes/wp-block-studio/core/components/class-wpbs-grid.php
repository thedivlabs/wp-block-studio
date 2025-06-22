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

	public function rest_request( WP_REST_Request $request ): WP_REST_Response|WP_Error {

		$card  = $request->get_param( 'card' );
		$query = $request->get_param( 'query' );
		$page  = $request->get_param( 'page' );

		$loop = new WPBS_Loop( $card, $query, intval( $page ) );

		return new WP_REST_Response(
			array_filter( [
				'status'  => 200,
				'content' => $loop->content ?? null,
				'css'     => $loop->css ?? null,
				'is_last' => $loop->is_last ?? null,
				'$loop'   => $loop,
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


