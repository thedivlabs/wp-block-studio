<?php

class WPBS_Service {

	private static WPBS_Service $instance;

	private static string $singular;
	private static string $plural;
	public static string $slug;

	private static array $taxonomies;

	private function __construct() {

		self::$singular = 'Service';
		self::$plural   = 'Services';
		self::$slug     = sanitize_title( self::$singular );

		$labels = [
			'archives' => self::$plural
		];

		self::$taxonomies[] = [
			'singular'  => 'Service Category',
			'plural'    => 'Service Categories',
			'slug'      => 'service-category',
			'menu_name' => 'Categories',
		];


		WPBS_CPT::register( self::$singular, self::$plural, self::$slug, [
			'menu_icon'     => 'dashicons--services',
			'menu_position' => 25,
			'supports'      => [ 'title', 'editor', 'thumbnail', 'excerpt' ],
			'has_archive'   => 'services',
			'taxonomies'    => array_merge( array_column( self::$taxonomies, 'slug' ), [ 'service-area' ] ),
		], $labels, true, true );


		foreach ( self::$taxonomies as $tax ) {
			WPBS_taxonomy::register( $tax['singular'], $tax['plural'], self::$slug, $tax['slug'], false, [
				'menu_name' => $tax['menu_name']
			] );
		}

		add_action( 'pre_get_posts', [ $this, 'query_settings' ], 10 );

	}


	public function query_settings( $query ): void {

		if ( ! $query->is_main_query() || ( $query->query_vars['post_type'] ?? false ) !== self::$slug ) {
			return;
		}

		$query->set( 'posts_per_page', - 1 );
	}

	public static function init(): WPBS_Service {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Service();
		}

		return self::$instance;
	}

}