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

		add_action( 'acf/save_post', [ $this, 'clear_transients' ], 20 );
		add_action( 'rest_api_init', [ $this, 'register_endpoint' ] );

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

	public function render_block( WP_REST_Request $request ): WP_REST_Response {
		$unique_id     = $request->get_param( 'uniqueId' );
		$block_context = $request->get_param( 'blockContext' );

		$response_data = array(
			'success'  => true,
			'rendered' => ( new WP_Block( [
				'blockName' => 'wpbs/media-gallery-container',
				'attrs'     => [
					'unique_id'    => $unique_id,
					'blockContext' => $block_context,
				]
			] ) )->render(),
		);

		// Return a WP_REST_Response object
		return new WP_REST_Response( $response_data, 200 );
	}

	public function register_endpoint(): void {
		register_rest_route( 'wpbs/v1', '/media-gallery', array(
			'methods'             => 'POST', // Or 'GET' if you prefer, but POST is fine for sending data
			'callback'            => [ $this, 'render_block' ],
			'permission_callback' => '__return_true', // Allows public access (no authentication required)
			'args'                => array(
				'uniqueId'     => array(
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => function ( $param, $request, $key ) {
						// Basic validation: check if it's not empty
						return ! empty( $param );
					},
				),
				'blockContext' => array(
					'type' => 'object',
				)
			),
		) );
	}

	public function clear_transients( $post_id ): void {
		if ( get_post_type( $post_id ) === self::SLUG ) {
			delete_transient( self::TRANSIENT_PREFIX . $post_id );
		}
	}

	public static function init(): WPBS_Media_Gallery {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Media_Gallery();
		}

		return self::$instance;
	}

}


