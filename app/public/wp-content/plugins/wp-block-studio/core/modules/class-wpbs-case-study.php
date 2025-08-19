<?php

class WPBS_Case_Study {

	private static WPBS_Case_Study $instance;

	private static string $singular;
	private static string $plural;
	public static string $slug;

	private static array $taxonomies;

	private function __construct() {

		self::$singular = 'Case Study';
		self::$plural   = 'Case Studies';
		self::$slug     = sanitize_title( self::$singular );

		$labels = [
			'archives' => self::$plural
		];

		self::$taxonomies[] = [
			'singular'  => 'Case Study Category',
			'plural'    => 'Case Study Categories',
			'slug'      => 'case-study-category',
			'menu_name' => 'Categories',
		];


		WPBS_CPT::register( self::$singular, self::$plural, self::$slug, [
			'menu_icon'     => 'dashicons--case-studies',
			'menu_position' => 25,
			'supports'      => [ 'title', 'editor', 'thumbnail', 'excerpt' ],
			'has_archive'   => 'case-studies',
			'taxonomies'    => array_merge( array_column( self::$taxonomies, 'slug' ), [ 'case-study-area' ] ),
		], $labels, false, true );


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

	public static function init(): WPBS_Case_Study {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Case_Study();
		}

		return self::$instance;
	}

}