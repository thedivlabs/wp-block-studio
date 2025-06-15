<?php

class WPBS_Media_Gallery {

	private static WPBS_Media_Gallery $instance;
	private static string $selector;

	private function __construct() {


		self::$selector = 'wpbs-media-gallery';

		add_action( 'rest_api_init', function () {
			register_rest_route( 'wpbs/v1', "/media-gallery/",
				[
					'methods'             => 'POST',
					'accept_json'         => true,
					'callback'            => [ $this, 'rest_request' ],
					'permission_callback' => function () {
						$nonce = $_SERVER['HTTP_X_WP_NONCE'] ?? null;

						return $nonce && wp_verify_nonce( $nonce, 'wp_rest' );
					},
					'args'                => [
						'id' => [
							'type'              => 'integer',
							'default'           => 0,
							'sanitize_callback' => 'absint',
						],

					],
				]
			);
		} );


	}


	public static function query( $id = 0 ): WP_Query|bool|array {


		$query_args = [
			'post_type'      => $query['post_type'] ?? 'post',
			'posts_per_page' => $query['posts_per_page'] ?? get_option( 'posts_per_page' ),
			'orderby'        => $query['orderby'] ?? 'date',
			'order'          => $query['order'] ?? 'DESC',
			'post__not_in'   => $query['post__not_in'] ?? [],
			'paged'          => $page ?: 1,
		];

		if ( ! empty( $query['taxonomy'] ) ) {

			$taxonomy = get_term( $query['term'] ?? false )->taxonomy ?? false;

			if ( ! empty( $taxonomy ) ) {
				$query_args['tax_query'] = [
					[
						'taxonomy' => $taxonomy,
						'field'    => 'term_id',
						'terms'    => $query['term'] ?? false,
					]
				];
			}

		}

		return new WP_Query( $query_args );

	}

	public function rest_request( WP_REST_Request $request ): WP_REST_Response|WP_Error {

		$id = $request->get_params();

		if ( empty( $id ) ) {
			die();
		}

		return new WP_REST_Response(
			[
				'status'   => 200,
				'response' => [
					'media' => self::query( $id )
				]
			]
		);

	}

	public static function init(): WPBS_Media_Gallery {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Media_Gallery();
		}

		return self::$instance;
	}

}


