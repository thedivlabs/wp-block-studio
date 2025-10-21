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

		$parsed_css = $attributes['wpbs-css'] ?? [];

		// Helper: convert array of props to CSS string
		$props_to_css = function ( $props = [], $important = false, $importantKeysCustom = [] ) {
			// Default important keys
			$importantProps = array_merge( [
				'padding',
				'margin',
				'gap',
				'width',
				'min-width',
				'max-width',
				'height',
				'min-height',
				'max-height',
				'color',
				'background-color',
				'border-color',
				'font-size',
				'line-height',
				'letter-spacing',
				'border-width',
				'border-radius',
				'opacity',
				'box-shadow',
				'filter',
			], $importantKeysCustom );

			$result = '';

			foreach ( $props as $k => $v ) {
				if ( $v === null || $v === '' || ! is_string( $v ) ) {
					continue;
				}

				// Check if property should get !important
				$needsImportant = $important && array_reduce(
						$importantProps,
						fn( $carry, $sub ) => $carry || str_contains( $k, $sub ),
						false
					);

				$result .= $k . ': ' . $v . ( $needsImportant ? ' !important' : '' ) . '; ';
			}

			return trim( $result );
		};


		// Helper: build CSS from parsed object + selector
		$build_css = function ( $css_obj, string $sel ) use ( $props_to_css, $breakpoints_config ) {
			$css_obj = (array) $css_obj; // <-- force array
			$result  = '';

			// default props
			if ( ! empty( $css_obj['props'] ) && is_array( $css_obj['props'] ) ) {
				$result .= $sel . ' { ' . $props_to_css( $css_obj['props'] ) . ' } ';
			}

			// breakpoints
			if ( ! empty( $css_obj['breakpoints'] ) && is_array( $css_obj['breakpoints'] ) ) {
				foreach ( $css_obj['breakpoints'] as $bp_key => $bp_props ) {
					if ( empty( $bp_props ) || ! is_array( $bp_props ) ) {
						continue;
					}

					$bp = $breakpoints_config[ $bp_key ] ?? null;
					if ( ! $bp || empty( $bp['size'] ) ) {
						continue;
					}

					$result .= "@media (max-width: " . ( $bp['size'] - 1 ) . "px) { {$sel} { " . $props_to_css( $bp_props, true ) . " } } ";
				}
			}

			// hover
			if ( ! empty( $css_obj['hover'] ) && is_array( $css_obj['hover'] ) ) {
				$result .= $sel . ':hover { ' . $props_to_css( $css_obj['hover'] ) . ' } ';
			}

			return $result;
		};

		// Main block CSS
		$css = $build_css( $parsed_css, $selector );

		// Background CSS
		$background_css = '';
		if ( ! empty( $parsed_css['background'] ) && is_array( $parsed_css['background'] ) ) {
			$bg_selector    = $selector . ' > .wpbs-background';
			$background_css = $build_css( $parsed_css['background'], $bg_selector );
		}

		$final_css = trim( $css . ' ' . $background_css );
		if ( empty( $final_css ) ) {
			return '';
		}

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


