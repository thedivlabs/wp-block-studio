<?php

class WPBS_Blocks {

	private static WPBS_Blocks $instance;
	public static string|bool $version;

	private function __construct() {

		self::$version = wp_get_theme()->version ?? false;

		add_action( 'init', [ $this, 'register_blocks' ] );


	}

	public function render_block( $attributes, $content, $block ): string {

		$css = WPBS_Style::block_styles( $attributes, $block );

		add_filter( 'wpbs_preload_images_responsive', function ( $images ) use ( $block ) {

			$block_images = array_map( function ( $image ) use ( $block ) {
				return array_merge( $image, [
					'breakpoint' => WPBS_Style::get_breakpoint( $block->attributes )
				] );
			}, $block->attributes['preload'] ?? [] );

			return array_merge( $images, $block_images );


		} );

		return $content;
	}

	public function register_blocks(): void {

		$block_dirs = glob( WPBS::$path . '/blocks/*', GLOB_ONLYDIR );

		foreach ( $block_dirs as $block_dir ) {

			$block_object = json_decode( file_get_contents( $block_dir . '/block.json' ), true );

			if ( ! $block_object ) {
				continue;
			}

			$args = [
				'render_callback' => [ $this, 'render_block' ]
			];

			$block = register_block_type( $block_dir, array_merge( [], $block_object, array_filter( $args ) ) );
		}
	}

	public static function init(): WPBS_Blocks {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Blocks();
		}

		return self::$instance;
	}

}


