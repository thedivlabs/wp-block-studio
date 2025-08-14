<?php


class WPBS_FAQ {

	private static WPBS_FAQ $instance;
	private static string $singular;
	private static string $plural;
	public static string $slug;

	private function __construct() {

		self::$singular = 'FAQ';
		self::$plural   = 'FAQs';
		self::$slug     = 'faq';

		$args = [
			'supports'      => [ 'title', 'permalink' ],
			'menu_position' => 25,
			'menu_icon'     => 'dashicons--faqs',
			'has_archive'   => false,
		];

		$labels = [
			'menu_name' => 'FAQ',
			'archives'  => 'Frequently Asked Questions',
		];

		WPBS_CPT::register( self::$singular, self::$plural, self::$slug, $args, $labels, false, false, false, true );

	}

	public static function init(): WPBS_FAQ {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_FAQ();
		}

		return self::$instance;
	}

}
