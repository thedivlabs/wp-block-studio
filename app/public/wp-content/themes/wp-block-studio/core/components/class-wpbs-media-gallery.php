<?php

class WPBS_Media_Gallery {

	private static WPBS_Media_Gallery $instance;
	private static string $cpt_id;
	private const TRANSIENT_PREFIX = 'wpbs_media_gallery_';
	private const ACF_FIELD = 'wpbs_media_gallery';


	private function __construct() {


		self::$cpt_id = 'media-gallery';

		add_action( 'rest_api_init', [ $this, 'init_rest' ] );
		add_action( 'acf/save_post', [ $this, 'clear_transients' ], 20 );

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
			$meta   = wp_get_attachment_metadata( $attachment_id );

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

	private function init_rest(): void {
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
	}

	private function clear_transients( $post_id ): void {
		if ( get_post_type( $post_id ) === self::$cpt_id ) {
			delete_transient( self::TRANSIENT_PREFIX . $post_id );
		}
	}

	private static function query( $id = 0 ): array {

		if ( ! is_numeric( $id ) || $id <= 0 ) {
			return [];
		}

		$transient_id = self::TRANSIENT_PREFIX . $id;

		$result = get_transient( $transient_id );

		if ( empty( $result ) ) {

			$result = self::parse_acf_data( get_field( self::ACF_FIELD, $id ) ?: [] );

			if ( ! empty( $result ) ) {
				set_transient( $transient_id, $result, DAY_IN_SECONDS );
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


