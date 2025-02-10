<?php

class WPBS_Blocks {

	private static WPBS_Blocks $instance;
	public static string|bool $version;

	private function __construct() {

		self::$version = wp_get_theme()->version ?? false;

		add_action( 'init', [ $this, 'register_blocks' ] );


	}

	public function register_blocks(): void {

		$block_dirs = glob( get_stylesheet_directory() . '/blocks/*', GLOB_ONLYDIR );

		foreach ( $block_dirs as $block_dir ) {
			register_block_type( $block_dir );
		}
	}

	public static function init(): WPBS_Blocks {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Blocks();
		}

		return self::$instance;
	}

}


