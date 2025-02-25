<?php

class WPBS_Blocks {

	private static WPBS_Blocks $instance;
	public static string|bool $version;

	private function __construct() {

		self::$version = wp_get_theme()->version ?? false;

		add_action( 'init', [ $this, 'register_blocks' ] );
		add_filter( 'register_block_type_args', [ $this, 'block_args' ], 10, 3 );

	}

	public function render_block( $attributes, $content, $block ): string {

		WPBS_Style::block_styles( $attributes, $block );

		return $content;
	}

	public function block_args( $args, $block_type ): array {


		if ( str_starts_with( $block_type, 'wpbs' ) ) {

			$args['render_callback'] = [ $this, 'render_block' ];
		}

		return $args;

	}

	public function register_blocks(): void {

		$block_dirs = glob( WPBS::$path . '/blocks/*', GLOB_ONLYDIR );

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


