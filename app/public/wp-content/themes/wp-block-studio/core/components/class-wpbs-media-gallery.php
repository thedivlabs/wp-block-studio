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
				'methods'             => 'POST',
				'accept_json'         => true,
				'callback'            => [ $this, 'rest_request' ],
				'permission_callback' => function () {
					$nonce = $_SERVER['HTTP_X_WP_NONCE'] ?? null;

					return $nonce && wp_verify_nonce( $nonce, 'wp_rest' );
				},
				'args'                => [
					'galleryId'    => [
						'type'              => 'integer',
						'default'           => 0,
						'sanitize_callback' => 'absint',
					],
					'pageNumber'   => [
						'type'              => 'integer',
						'default'           => 0,
						'sanitize_callback' => 'absint',
					],
					'pageSize'     => [
						'type'              => 'integer',
						'default'           => 0,
						'sanitize_callback' => 'absint',
					],
					'cardTemplate' => [
						'type'              => 'string',
						'default'           => '',
						'sanitize_callback' => [ 'WPBS', 'sanitize_block_template' ],
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

	public static function loop( $card, $query = [], $page = 1 ): object|bool {

		if ( empty( $card ) || empty( $query['gallery_id'] ) ) {
			return false;
		}

		$block_template = WPBS::get_block_template( $card );
		[ 'media' => $media, 'is_last' => $is_last ] = self::query( $query, $page );
		$original_id = $card['attrs']['uniqueId'] ?? '';

		$content = '';

		foreach ( $media ?: [] as $k => $image ) {

			if ( empty( $image['id'] ) ) {
				continue;
			}

			$image_id = $image['id'];

			$new_id = $original_id . '--' . $image_id;

			$unique_id = join( ' ', array_filter( [
				$original_id ?? null,
				$new_id
			] ) );

			$block_template['attrs']['uniqueId'] = $unique_id;
			$block_template['attrs']['imageId']  = $image_id;
			$block_template['attrs']['index']    = $k;

			$new_block = new WP_Block( $block_template, array_filter( [
				'uniqueId' => $unique_id,
				'imageId'  => $image_id,
				'index'    => $k,
			] ) );

			$content .= $new_block->render();
		}

		return (object) [
			'content' => $content,
			'is_last' => $is_last,
			'query'   => $query,
			'media'   => $media,
			'card'    => $block_template
		];
	}

	public static function output_args( $loop, $block ): string|bool {

		if ( empty( $loop->card ) || empty( $loop->query ) ) {
			return false;
		}

		$grid_settings  = $block->attributes['wpbs-grid'] ?? [];
		$query_settings = $block->attributes['wpbs-media-gallery'] ?? [];

		return '<script class="wpbs-args" type="application/json">' . wp_json_encode( array_filter( [
				'card'     => $loop->card,
				'uniqueId' => $block->attributes['uniqueId'] ?? null,
				...$grid_settings,
				...$query_settings,
			] ) ) . '</script>';


	}

	public static function query( $query = [], $page = 1 ): array {

		if ( empty( $query['gallery_id'] ) || ! is_numeric( $query['gallery_id'] ) || $query['gallery_id'] <= 0 ) {
			return [];
		}

		$transient_id = self::TRANSIENT_PREFIX . $query['gallery_id'];

		$media = get_transient( $transient_id );

		if ( empty( $media ) ) {

			$images = self::parse_acf_data( get_field( 'wpbs_images', $query['gallery_id'] ) ?: [] );
			$video  = self::parse_acf_data( get_field( 'wpbs_video', $query['gallery_id'] ) ?: [] );

			if ( ! empty( $query['video_first'] ) ) {
				$media = WPBS::clean_array( [ ...$video, ...$images ] );
			} else {
				$media = WPBS::clean_array( [ ...$images, ...$video ] );
			}

			if ( ! empty( $media ) ) {
				set_transient( $transient_id, $media, self::TRANSIENT_EXPIRATION );
			}

		}

		$is_last = $page >= ( count( $media ) / ( $query['page_size'] ?? 0 ) );

		if ( ! empty( $query['page_size'] ) ) {

			$page      = intval( $page );
			$page_size = intval( $query['page_size'] );
			$offset    = ( $page - 1 ) * $page_size;

			$media = array_slice( $media, $offset, $page_size );

		}

		return [
			'media'   => $media,
			'is_last' => $is_last,
		];
	}

	public function rest_request( WP_REST_Request $request ): WP_REST_Response|WP_Error {

		$gallery_id  = $request->get_param( 'gallery_id' );
		$video_first = $request->get_param( 'video_first' );
		$page_number = $request->get_param( 'page_number' );
		$page_size   = $request->get_param( 'page_size' );
		$card        = $request->get_param( 'card' );

		if ( empty( $gallery_id ) ) {
			return new WP_Error( 'error', 'Something went wrong.', [
				'status' => 400
			] );
		}

		$loop = self::loop( $card, [
			'page_size'   => $page_size,
			'gallery_id'  => $gallery_id,
			'video_first' => ! empty( $video_first ),
		], $page_number );


		return new WP_REST_Response(
			[
				'status'  => 200,
				'content' => wp_kses_post( $loop->content ?? '' ),
				'query'   => $loop->query,
				'media'   => $loop->media,
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


