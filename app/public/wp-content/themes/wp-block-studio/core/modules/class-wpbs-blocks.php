<?php

class WPBS_Blocks {

	private static WPBS_Blocks $instance;
	public static string|bool $version;

	private function __construct() {

		self::$version = wp_get_theme()->version ?? false;

		add_action( 'init', [ $this, 'register_blocks' ] );

	}

	public static function render_block_styles( $attributes, $custom_css = '' ): void {

		add_filter( 'wpbs_preload_images_responsive', function ( $images ) use ( $attributes ) {

			$breakpoint = wp_get_global_settings()['custom']['breakpoints'][ array_filter( array_map( function ( $prop ) {
				return ! empty( $prop );
			}, [
				$attributes['wpbs-layout-breakpoint'] ?? null,
				$attributes['wpbs-breakpoint-large'] ?? null
			] ) )[0] ?? 'normal' ];

			$block_images = array_map( function ( $image ) use ( $attributes, $breakpoint ) {
				return array_merge( $image, [
					'breakpoint' => $breakpoint
				] );
			}, $attributes['preload'] ?? [] );

			return array_merge( $images, $block_images );

		} );

		add_filter( 'wpbs_critical_css', function ( $css_array ) use ( $attributes, $custom_css ) {
			WPBS::console_log( $attributes );
			if ( empty( $attributes['uniqueId'] ) || empty( $attributes['wpbs-css'] ) ) {
				return $css_array;
			}

			$css_array[ $attributes['uniqueId'] ] = $attributes['wpbs-css'];

			if ( ! empty( $custom_css ) ) {
				$css_array[ $attributes['uniqueId'] . '-custom' ] = $custom_css;
			}


			return $css_array;
		} );
	}

	public function render_block( $attributes, $content ): string {

		self::render_block_styles( $attributes );

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
				'attributes' => [
					'wpbs-css'   => [
						'type'         => 'string',
						'show_in_rest' => true,
					],
					'wpbs-props' => [
						'type'         => 'object',
						'show_in_rest' => true,
					]
				]
			];


			if ( empty( $block_object['render'] ) && empty( $block_object['render_callback'] ) ) {

				$args['render_callback'] = [ $this, 'render_block' ];

			}

			$args = array_merge_recursive( [], $block_object, array_filter( $args ?? [] ) );

			$block = register_block_type( $block_dir, $args );
		}
	}

	public static function init(): WPBS_Blocks {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Blocks();
		}

		return self::$instance;
	}

}


