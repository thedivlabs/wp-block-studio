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
					'gallery_id'  => [
						'type'              => 'integer',
						'default'           => 0,
						'sanitize_callback' => 'absint',
					],
					'page_number' => [
						'type'              => 'integer',
						'default'           => 0,
						'sanitize_callback' => 'absint',
					],
					'page_size'   => [
						'type'              => 'integer',
						'default'           => 0,
						'sanitize_callback' => 'absint',
					],
					'video_first' => [
						'type'    => 'boolean',
						'default' => false,
					],
					'card'        => [
						'type'              => 'string',
						'default'           => '',
						'sanitize_callback' => [ 'WPBS', 'sanitize_block_template' ],
					],

				],
			]
		);
	}

	public function clear_transients( $post_id ): void {
		if ( get_post_type( $post_id ) === self::SLUG ) {
			delete_transient( self::TRANSIENT_PREFIX . $post_id );
		}
	}

	public static function loop( $card, $settings = [], $page = 1 ): object|bool {

		if ( empty( $settings['gallery_id'] ) ) {
			return false;
		}

		[ 'media' => $media_gallery, 'is_last' => $is_last ] = self::query( $settings, $page );

		if ( ! empty( $card['blockName'] ) ) {
			$block_template = WPBS::get_block_template( $card );

			$content = '';

			foreach ( $media_gallery ?: [] as $k => $media ) {

				$media = [
					...$media,
					'lightbox' => false
				];

				$block_template['attrs']['uniqueId'] = $card['attrs']['uniqueId'] ?? '';
				$block_template['attrs']['index']    = $k;
				$block_template['attrs']['media']    = $media;

				$new_block = new WP_Block( $block_template, array_filter( [
					'media'     => $media,
					'index'     => $k,
					'is_slider' => ! empty( $settings['is_slider'] ),
					'gallery'   => $settings,
				] ) );

				$new_block->attributes['media'] = $media;

				$content .= $new_block->render();


			}
		} else {

			$content = [];


			foreach ( $media_gallery ?: [] as $k => $media ) {

				if ( ! empty( $media['id'] ) ) {
					$content[] = wp_get_attachment_image( $media['id'], 'large', false, array_filter( [
						'loading' => ! empty( $settings['eager'] ) ? 'eager' : 'lazy',
					] ) );
				}

				if ( ! empty( $media['link'] ) ) {

					$video = array_filter( [
						'link'     => $media['link'],
						'title'    => $media['title'] ?? null,
						'poster'   => $media['poster'] ?? null,
						'platform' => $media['platform'] ?? null,
					] );

					$content[] = ( new WP_Block( [
						'blockName' => 'wpbs/video-element',
						'attrs'     => [
							'wpbs-video' => $video
						]
					], array_filter( [
						'index' => $k,
					] ) ) )->render();
				}


			}
		}


		return (object) array_filter( [
			'content' => $content,
			'is_last' => $is_last,
			'card'    => $block_template ?? null
		] );
	}


	public function rest_request( WP_REST_Request $request ): WP_REST_Response|WP_Error {

		$gallery_id  = $request->get_param( 'gallery_id' );
		$video_first = $request->get_param( 'video_first' );
		$page_number = $request->get_param( 'page_number' );
		$page_size   = $request->get_param( 'page_size' );
		$card        = $request->get_param( 'card' );
		$lightbox    = $request->get_param( 'lightbox' );

		if ( empty( $gallery_id ) ) {
			return new WP_Error( 'error', 'Something went wrong.', [
				'status' => 400
			] );
		}

		$loop = self::loop( $card, [
			'page_size'   => $page_size,
			'gallery_id'  => $gallery_id,
			'video_first' => ! empty( $video_first ),
			'lightbox'    => ! empty( $lightbox ),
		], $page_number );


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


