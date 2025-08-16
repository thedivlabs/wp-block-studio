<?php

class WPBS_Features {

	private static WPBS_Features $instance;

	private static string $singular;
	private static string $plural;
	public static string $slug;


	private function __construct() {

		self::$singular = 'Feature';
		self::$plural   = 'Features';
		self::$slug     = sanitize_title( self::$singular );

		$labels = [
			'archives' => self::$plural
		];

		WPBS_CPT::register( self::$singular, self::$plural, self::$slug, [
			'menu_icon'     => 'dashicons-images-alt',
			'menu_position' => 25,
			'supports'      => [ 'title', 'editor', 'thumbnail', 'excerpt' ],
			'has_archive'   => 'features',
		], $labels, false, true );


		add_action( 'pre_get_posts', [ $this, 'query_settings' ], 10 );

	}


	public function query_settings( $query ): void {

		if ( ! $query->is_main_query() || ( $query->query_vars['post_type'] ?? false ) !== self::$slug ) {
			return;
		}

		$query->set( 'posts_per_page', - 1 );
	}

	public static function init(): WPBS_Features {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Features();
		}

		return self::$instance;
	}

}