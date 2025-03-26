<?php

class WPBS_Blocks {

	private static WPBS_Blocks $instance;
	public static string|bool $version;

	private function __construct() {

		self::$version = wp_get_theme()->version ?? false;

		add_action( 'init', [ $this, 'register_blocks' ] );

		//add_action( 'wp_head', [ $this, 'preload_images' ] );

	}

	public function render_block( $attributes, $content, $block ): string {

		$css = WPBS_Style::block_styles( $attributes, $block );

		/*add_filter( 'wpbs_preload_block_images', function ( $images ) use ( $block ) {

			$block_images = array_map( function ( $image ) use ( $block ) {
				return array_merge( $image, [
					'breakpoint' => WPBS_Style::get_breakpoint( $block->attributes )
				] );
			}, $block->attributes['preload'] ?? [] );

			$merged_images = array_merge( $images, $block_images );
			WPBS::console_log($merged_images);
			return $merged_images;



			//return [];
		} );*/

		return $content;
	}

	public function preload_images(): void {

		$images = apply_filters( 'wpbs_preload_block_images', [] );

		//WPBS::console_log($images);

		foreach ( $images as $image ) {

			$mobile_id    = $image['mobile'] ?? false;
			$mobile_src   = wp_get_attachment_image_src( $mobile_id, $image['size'] ?? 'full' )[0] ?? false;
			$mobile_query = ! empty( $image['breakpoint'] ) ? '(max-width: calc(' . $image['breakpoint'] . ' - 1px))' : null;

			if ( ! empty( $mobile_src ) ) {
				echo '<link rel="preload" href="' . esc_url( $mobile_src ) . '" as="image" media="' . $mobile_query . '">';
			}

			$large_id    = $image['large'] ?? false;
			$large_src   = wp_get_attachment_image_src( $large_id, $image['size'] ?? 'full' )[0] ?? false;
			$large_query = $mobile_src && ! empty( $image['breakpoint'] ) ? '(min-width: ' . $image['breakpoint'] . ')' : null;

			if ( ! empty( $large_src ) ) {
				echo '<link rel="preload" href="' . esc_url( $large_src ) . '" as="image" media="' . $large_query . '">';
			}


		}


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


