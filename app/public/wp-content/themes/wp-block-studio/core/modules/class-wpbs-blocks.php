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

		self::preload_images( $block );

		return $content;
	}

	private static function preload_images( $block ): void {

		add_action( 'wp_head', function () use ( $block ) {
			$breakpoint = WPBS_Style::get_breakpoint( $block->attributes );
			
			foreach ( $block->attributes['preload'] ?? [] as $image ) {

				$mobile_id    = $image['mobile']['id'] ?? false;
				$mobile_src   = wp_get_attachment_image_src( $mobile_id, $image['size'] ?? 'full' )[0] ?? false;
				$mobile_query = '(max-width: calc(' . $breakpoint . ' - 1px))';

				if ( ! empty( $mobile_src ) ) {
					echo '<link rel="preload" href="' . esc_url( $mobile_src ) . '" as="image" media="' . $mobile_query . '">';
				}

				$large_id    = $image['large']['id'] ?? false;
				$large_src   = wp_get_attachment_image_src( $large_id, $image['size'] ?? 'full' )[0] ?? false;
				$large_query = '(min-width: ' . $breakpoint . ')';

				if ( ! empty( $mobile_src ) ) {
					echo '<link rel="preload" href="' . esc_url( $large_src ) . '" as="image" media="' . $large_query . '">';
				}


			}
		} );


	}

	public function register_blocks(): void {

		$block_dirs = glob( WPBS::$path . '/blocks/*', GLOB_ONLYDIR );

		foreach ( $block_dirs as $block_dir ) {

			$block = register_block_type( $block_dir, [
				'render_callback' => [ $this, 'render_block' ]
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


