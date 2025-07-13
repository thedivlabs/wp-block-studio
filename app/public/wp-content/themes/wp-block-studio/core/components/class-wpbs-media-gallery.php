<?php

class WPBS_Media_Gallery {

	private static WPBS_Media_Gallery $instance;

	private const TRANSIENT_PREFIX = 'wpbs_media_gallery_';

	public const SINGULAR = 'Media Gallery';
	public const PLURAL = 'Media Galleries';
	public const SLUG = 'media-gallery';

	public const TAX_SINGULAR = 'Category';
	public const TAX_PLURAL = 'Categories';
	public const TAX_SLUG = 'media-gallery-category';


	private function __construct() {

		add_action( 'rest_api_init', [ $this, 'init_rest' ] );
		add_action( 'acf/save_post', [ $this, 'clear_transients' ], 20 );

		$args = [
			'supports'      => [ 'title', 'editor', 'permalink', 'thumbnail', 'excerpt' ],
			'menu_position' => 25,
			'menu_icon'     => 'dashicons-format-gallery',
			'has_archive'   => 'media-gallery',
			'taxonomies'    => [
				'media-gallery-category'
			]
		];

		$labels = [
			'menu_name' => 'Media Gallery',
			'archives'  => 'Media Gallery',
		];

		WPBS_CPT::register( self::SINGULAR, self::PLURAL, self::SLUG, $args, $labels );

		WPBS_Taxonomy::register( self::TAX_SINGULAR, self::TAX_PLURAL, self::SLUG, self::TAX_SLUG, false );

	}

	public function init_rest(): void {
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
					'page_number' => [
						'type'              => 'integer',
						'default'           => 0,
						'sanitize_callback' => 'absint',
					],
					'card'        => [
						'type'              => 'array',
						'sanitize_callback' => [ 'WPBS', 'sanitize_block_template' ],
					],
					'gallery'     => [
						'type'              => 'array',
						'sanitize_callback' => [ 'WPBS', 'recursive_sanitize' ],
					]

				],
			]
		);
	}

	public function clear_transients( $post_id ): void {
		if ( get_post_type( $post_id ) === self::SLUG ) {
			delete_transient( self::TRANSIENT_PREFIX . $post_id );
		}
	}

	public function rest_request( WP_REST_Request $request ): WP_REST_Response|WP_Error {


		$card        = $request->get_param( 'card' );
		$gallery     = $request->get_param( 'gallery' );
		$page_number = $request->get_param( 'page_number' );

		if ( empty( $gallery['settings']['galleryId'] ) ) {
			return new WP_Error( 'error', 'Something went wrong.', [
				'status' => 400
			] );
		}

		$container_block = ( new WP_Block( [
			'blockName' => 'wpbs/media-gallery-container',
		] ) );


		return new WP_REST_Response(
			[
				'status'  => 200,
				'content' => is_array( $loop->content ?? false ) ? array_map( function ( $c ) {
					return wp_kses_post( $c );
				}, $loop->content ) : wp_kses_post( $loop->content ?? '' ),
				'is_last' => ! empty( $loop->is_last ),
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


