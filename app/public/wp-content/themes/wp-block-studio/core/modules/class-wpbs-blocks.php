<?php

class WPBS_Blocks {

	private static WPBS_Blocks $instance;
	public static string|bool $version;

	private function __construct() {

		self::$version = wp_get_theme()->version ?? false;

		add_action( 'init', [ $this, 'register_blocks' ] );

	}

	public function render_block( $attributes, $content, $block ): string {

WPBS::console_log($attributes);

		$block->attributes['className'] = !empty($block->attributes['className']) ? $block->attributes['className'] : wp_get_elements_class_name($block);
		$attributes['className'] = !empty($attributes['className']) ? $attributes['className'] : wp_get_elements_class_name($block);

		$css = WPBS_Style::block_styles( $attributes, $block );

		return $content;
	}

	public function register_blocks(): void {

		$block_dirs = glob( WPBS::$path . '/blocks/*', GLOB_ONLYDIR );

		foreach ( $block_dirs as $block_dir ) {

			register_block_type( $block_dir, [
				'render_callback' => [ $this, 'render_block' ],
			] );
		}
	}

	public static function init(): WPBS_Blocks {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Blocks();
		}

		return self::$instance;
	}

}


