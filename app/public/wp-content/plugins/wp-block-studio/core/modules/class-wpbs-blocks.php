<?php

class WPBS_Blocks {

	private static WPBS_Blocks $instance;
	public static string|bool $version;

	private function __construct() {

		self::$version = wp_get_theme()->version ?? false;

		add_action( 'init', [ $this, 'register_blocks' ] );


		add_filter( 'render_block_data', function ( $parsed_block ) {
			if (
				isset( $parsed_block['blockName'] ) &&
				str_starts_with( $parsed_block['blockName'], 'wpbs/' ) &&
				! empty( $parsed_block['attrs']['wpbs-css'] )
			) {
				self::render_block_styles( $parsed_block['attrs'], $parsed_block['blockName'] );
			}

			return $parsed_block;
		}, 10 );


		if (
			function_exists( 'acf_add_options_page' )
		) {
			acf_add_options_page( array(
				'page_title' => 'Theme Settings',
				'menu_title' => 'Theme Settings',
				'menu_slug'  => 'theme-settings',
				'capability' => 'edit_posts',
				'redirect'   => false,
			) );
		}


	}

	public static function render_block_styles( array $attributes, string $blockName = '', bool $is_rest = false ): string|bool {

		if ( empty( $attributes['uniqueId'] ) || empty( $attributes['wpbs-css'] ) ) {
			return $is_rest ? true : '';
		}

		$unique_id = $attributes['uniqueId'];
		$selector  = '.wp-block-' . str_replace( '/', '-', $blockName ) . '.' . $unique_id;

		$block_css = $attributes['wpbs-css'];

		// Helper to convert array of props to CSS string
		$props_to_css = function ( array $props ): string {
			$lines = [];
			foreach ( $props as $key => $val ) {
				if ( $val === null || $val === '' ) {
					continue;
				}
				$lines[] = "{$key}: {$val};";
			}

			return implode( ' ', $lines );
		};

		$css = '';

		// 1. Default props
		if ( ! empty( $block_css['props'] ) ) {
			$css .= "{$selector} { " . $props_to_css( $block_css['props'] ) . " } ";
		}

		// 2. Breakpoints
		$breakpoints_config = wp_get_global_settings()['custom']['breakpoints'] ?? [];

		if ( ! empty( $block_css['breakpoints'] ) ) {
			foreach ( $block_css['breakpoints'] as $bp_key => $bp_props ) {
				if ( empty( $bp_props ) || empty( $breakpoints_config[ $bp_key ] ) ) {
					continue;
				}
				$bp_size = $breakpoints_config[ $bp_key ]['size'] ?? 0;
				$css     .= "@media (max-width: " . ( (int) $bp_size - 1 ) . "px) { ";
				$css     .= "{$selector} { " . $props_to_css( $bp_props ) . " } ";
				$css     .= "} ";
			}
		}

		// 3. Hover
		if ( ! empty( $block_css['hover'] ) ) {
			$css .= "{$selector}:hover { " . $props_to_css( $block_css['hover'] ) . " } ";
		}

		// REST output echoes the style tag
		if ( $is_rest ) {
			echo '<style>' . $css . '</style>';

			return true;
		}

		add_filter( 'wpbs_critical_css', function ( $css_array ) use ( $css, $unique_id ) {

			if ( empty( $css ) || empty( $unique_id ) ) {
				return $css_array;
			}

			$css_array[ $unique_id ] = $css;

			return $css_array;
		} );

		return $css;
	}

	public function render_block( $attributes, $content, $block ): string {

		self::render_block_styles( $attributes );

		return $content;
	}

	public function register_blocks(): void {

		$block_dirs = glob( WPBS::$path . 'build/*', GLOB_ONLYDIR );

		foreach ( $block_dirs as $block_dir ) {

			$block_object = json_decode( file_get_contents( $block_dir . '/block.json' ), true );

			if ( ! $block_object ) {
				continue;
			}

			$extra_attributes = [
				'wpbs-css'     => [
					'type'         => 'string',
					'show_in_rest' => true,
				],
				'wpbs-preload' => [
					'type'         => 'object',
					'show_in_rest' => true,
				],
				'wpbs-props'   => [
					'type'         => 'object',
					'show_in_rest' => true,
				],
			];

			$block_object['attributes'] = array_merge(
				$block_object['attributes'] ?? [],
				$extra_attributes
			);

			if ( empty( $block_object['render'] ) && empty( $block_object['render_callback'] ) ) {
				$block_object['render_callback'] = [ $this, 'render_block' ];
			}

			$block = register_block_type( $block_dir, $block_object );

		}
	}

	public static function init(): WPBS_Blocks {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Blocks();
		}

		return self::$instance;
	}

}


