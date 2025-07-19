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

		WPBS::console_log( 'qqqqq' );

		WPBS_CPT::register( self::SINGULAR, self::PLURAL, self::SLUG, $args, $labels );

		WPBS_Taxonomy::register( self::TAX_SINGULAR, self::TAX_PLURAL, self::SLUG, self::TAX_SLUG, false );

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


