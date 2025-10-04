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

	public static function render_block_styles( array $attributes, string $name = '', bool $is_rest = false ): string|bool {

		if ( empty( $attributes['uniqueId'] ) ) {
			return '';
		}

		$breakpoints_config = wp_get_global_settings()['custom']['breakpoints'] ?? [];

		$unique_id = $attributes['uniqueId'];
		$selector  = '.wp-block-' . str_replace( '/', '-', $name ) . '.' . $unique_id;

		$css            = '';
		$background_css = '';

		// Helper: convert array of props to CSS string
		$props_to_css = function ( $props = array() ) {
			$result = '';
			foreach ( $props as $k => $v ) {
				if ( $v !== null && $v !== '' ) {
					$result .= $k . ': ' . $v . '; ';
				}
			}

			return trim( $result );
		};

		$parsed_css = $attributes['wpbs-css'] ?? array();

		// -------- Main block props --------
		if ( ! empty( $parsed_css['props'] ) && is_array( $parsed_css['props'] ) ) {
			$css .= $selector . ' { ' . $props_to_css( $parsed_css['props'] ) . ' } ';
		}

		// Breakpoints
		if ( ! empty( $parsed_css['breakpoints'] ) && is_array( $parsed_css['breakpoints'] ) ) {
			foreach ( $parsed_css['breakpoints'] as $bp_key => $bp_props ) {
				if ( empty( $bp_props ) || ! is_array( $bp_props ) ) {
					continue;
				}

				// You need to define WPBS_BREAKPOINTS in PHP
				$bp = $breakpoints_config[ $bp_key ] ?? null;
				if ( ! $bp || empty( $bp['size'] ) ) {
					continue;
				}

				$css .= "@media (max-width: " . ( $bp['size'] - 1 ) . "px) { {$selector} { " . $props_to_css( $bp_props ) . " } } ";
			}
		}

		// Hover
		if ( ! empty( $parsed_css['hover'] ) && is_array( $parsed_css['hover'] ) ) {
			$css .= $selector . ':hover { ' . $props_to_css( $parsed_css['hover'] ) . ' } ';
		}

		// -------- Background props --------
		if ( ! empty( $parsed_css['background'] ) && is_array( $parsed_css['background'] ) ) {
			$bg_selector = $selector . ' > .wpbs-background';
			$bg          = $parsed_css['background'];

			if ( ! empty( $bg['props'] ) && is_array( $bg['props'] ) ) {
				$background_css .= $bg_selector . ' { ' . $props_to_css( $bg['props'] ) . ' } ';
			}

			if ( ! empty( $bg['breakpoints'] ) && is_array( $bg['breakpoints'] ) ) {
				foreach ( $bg['breakpoints'] as $bp_key => $bp_props ) {
					if ( empty( $bp_props ) || ! is_array( $bp_props ) ) {
						continue;
					}

					$bp = $breakpoints_config[ $bp_key ] ?? null;
					if ( ! $bp || empty( $bp['size'] ) ) {
						continue;
					}

					$background_css .= "@media (max-width: " . ( $bp['size'] - 1 ) . "px) { {$bg_selector} { " . $props_to_css( $bp_props ) . " } } ";
				}
			}

			if ( ! empty( $bg['hover'] ) && is_array( $bg['hover'] ) ) {
				$background_css .= $bg_selector . ':hover { ' . $props_to_css( $bg['hover'] ) . ' } ';
			}
		}

		$final_css = trim( $css . ' ' . $background_css );
		if ( empty( $final_css ) ) {
			return '';
		}

		// REST output echoes the style tag
		if ( $is_rest ) {
			echo '<style>' . $final_css . '</style>';

			return true;
		}

		add_filter( 'wpbs_critical_css', function ( $css_array ) use ( $final_css, $unique_id ) {

			if ( empty( $final_css ) || empty( $unique_id ) ) {
				return $css_array;
			}

			$css_array[ $unique_id ] = $final_css;

			return $css_array;
		} );

		return $final_css;
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


