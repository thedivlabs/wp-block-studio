<?php

class WPBS_Shortcodes {

	private static WPBS_Shortcodes $instance;

	private function __construct() {
		add_shortcode( 'current_date', [ $this, 'current_date' ] );
	}

	public function current_date( $attrs = [] ): string {
		$context = shortcode_atts(
			[
				'format' => 'year',
				'prefix' => '',
			],
			$attrs,
			'current_date'
		);

		return (new WP_Block( [
			'blockName' => 'wpbs/current-date',
			'attrs'     => [],
		], [
			'format' => $context['format'],
			'prefix' => $context['prefix'],
		] ))->render();
	}


	public static function init(): WPBS_Shortcodes {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Shortcodes();
		}

		return self::$instance;
	}
}