<?php

class WPBS_Media_Gallery {

	private static WPBS_Media_Gallery $instance;

	private const TRANSIENT_PREFIX = 'wpbs_media_gallery_';
	private const TRANSIENT_EXPIRATION = DAY_IN_SECONDS;
	private const ACF_FIELD = 'wpbs_media_gallery';

	public static string $singular;
	public static string $plural;
	public static string $slug;

	public static string $tax_singular;
	public static string $tax_plural;
	public static string $tax_slug;


	private function __construct() {

		self::$singular = 'Media Gallery';
		self::$plural   = 'Media Galleries';
		self::$slug     = 'media-gallery';

		self::$tax_singular = 'Category';
		self::$tax_plural   = 'Categories';
		self::$tax_slug     = 'media-gallery-category';

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

		WPBS_CPT::register( self::$singular, self::$plural, self::$slug, $args, $labels );

		WPBS_Taxonomy::register( self::$tax_singular, self::$tax_plural, self::$slug, self::$tax_slug, false );

	}

	private static function parse_acf_data( $field_data ): array {

		if ( ! is_array( $field_data ) ) {
			return [];
		}

		return array_values( array_filter( array_map( function ( $media_id ) {

			$attachment_id = absint( $media_id );

			if ( ! $attachment_id || 'attachment' !== get_post_type( $attachment_id ) ) {
				return null;
			}

			$src    = wp_get_attachment_image_url( $attachment_id, 'full' );
			$srcset = wp_get_attachment_image_srcset( $attachment_id, 'full' );
			$alt    = get_post_meta( $attachment_id, '_wp_attachment_image_alt', true );
			$meta   = wp_get_attachment_metadata( $attachment_id ) ?: [];

			return array_filter( [
				'id'     => $attachment_id,
				'alt'    => $alt ?: '',
				'src'    => $src,
				'srcset' => $srcset,
				'width'  => $meta['width'] ?? null,
				'height' => $meta['height'] ?? null,
			] );

		}, $field_data ) ) );
	}

	public function init_rest(): void {
		register_rest_route( 'wpbs/v1', "/media-gallery/",
			[
				'methods'             => 'GET',
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
	}

	public function clear_transients( $post_id ): void {
		if ( get_post_type( $post_id ) === self::$slug ) {
			delete_transient( self::TRANSIENT_PREFIX . $post_id );
		}
	}


	public static function view_args( $args = [] ): string|bool {
		if ( empty( $args ) ) {
			return false;
		}

		$args = array_filter( $args, function ( $prop ) {
			return ! in_array( $prop, [
				'card-class',
				'gallery-id'
			] );
		}, ARRAY_FILTER_USE_KEY );

		return '<script class="wpbs-media-gallery-args" type="application/json">' . json_encode( $args ) . '</script>';
	}

	public static function query( $id = 0, $args = [] ): array {

		if ( ! is_numeric( $id ) || $id <= 0 ) {
			return [];
		}

		$transient_id = self::TRANSIENT_PREFIX . $id;

		$result = get_transient( $transient_id );

		if ( empty( $result ) ) {

			$images = self::parse_acf_data( get_field( 'wpbs_images', $id ) ?: [] );
			$video  = self::parse_acf_data( get_field( 'wpbs_video', $id ) ?: [] );

			$result = WPBS::clean_array( [
				'images' => $images,
				'video'  => $video,
			] );

			if ( ! empty( $result ) ) {
				set_transient( $transient_id, $result, self::TRANSIENT_EXPIRATION );
			}

		}

		return $result;
	}

	private function rest_request( WP_REST_Request $request ): WP_REST_Response|WP_Error {

		$id = $request->get_param( 'id' ); // singular, not plural

		if ( empty( $id ) ) {
			return new WP_Error( 'no_id', 'Missing ID parameter.', [ 'status' => 400 ] );
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


