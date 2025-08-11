<?php


class WPBS_Review {

	private static WPBS_Review $instance;
	private static string $singular;
	private static string $plural;
	private static string $slug;

	private function __construct() {

		self::$singular = 'Review';
		self::$plural   = 'Reviews';
		self::$slug     = sanitize_title( self::$singular );

		$args = [
			'menu_icon'     => 'dashicons--reviews',
			'supports'      => [ 'title' ],
			'menu_position' => 25,
			'has_archive'   => 'reviews'
		];

		WPBS_CPT::register( self::$singular, self::$plural, self::$slug, $args, false, true, false, true, true );


	}

	public static function init(): WPBS_Review {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Review();
		}

		return self::$instance;
	}


}

