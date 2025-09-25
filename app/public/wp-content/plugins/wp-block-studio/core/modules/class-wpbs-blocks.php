<?php

class WPBS_Blocks {

	private static WPBS_Blocks $instance;
	public static string|bool $version;

	private function __construct() {

		self::$version = wp_get_theme()->version ?? false;

		add_action( 'init', [ $this, 'register_blocks' ] );

		add_filter( 'block_type_metadata', function ( $metadata ) {
			
			if ( ! str_starts_with( $metadata['name'], 'wpbs' ) ) {
				return $metadata;
			}

			// Add a new attribute to all blocks
			$metadata['attributes']['wpbs-preload'] = [
				'type'    => 'array',
				'default' => [],
			];

			return $metadata;
		}, 10 );

		add_filter( 'render_block_data', function ( $parsed_block ) {
			if (
				isset( $parsed_block['blockName'] ) &&
				str_starts_with( $parsed_block['blockName'], 'wpbs/' ) &&
				! empty( $parsed_block['attrs']['wpbs-css'] )
			) {
				self::render_block_styles( $parsed_block['attrs'] );
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

	public static function render_block_styles( $attributes, $custom_css = '', $is_rest = false ): string|bool {

		$breakpoints = wp_get_global_settings()['custom']['breakpoints'] ?? [];
		$containers  = wp_get_global_settings()['custom']['container'] ?? [];
		$css         = preg_replace_callback( '/%__(BREAKPOINT|CONTAINER)__(.*?)__%/', function ( $matches ) use ( $breakpoints, $containers ) {
			[ $full, $type, $key ] = $matches;

			return match ( $type ) {
				'BREAKPOINT' => $breakpoints[ $key ] ?? $breakpoints['normal'],
				'CONTAINER' => $key === 'none' ? '100%' : $containers[ $key ] ?? $full,
				default => $full,
			};
		}, ( $attributes['wpbs-css'] ?? '' ) );
		$custom_css  = preg_replace_callback( '/%__(BREAKPOINT|CONTAINER)__(.*?)__%/', function ( $matches ) use ( $breakpoints, $containers ) {
			[ $full, $type, $key ] = $matches;

			if ( $key === 'none' ) {
				return null;
			}

			return match ( $type ) {
				'BREAKPOINT' => $breakpoints[ $key ] ?? $breakpoints['normal'],
				'CONTAINER' => $containers[ $key ] ?? $full,
				default => $full,
			};
		}, $custom_css );

		$css = apply_filters( 'wpbs_block_css', $css, $attributes );

		add_filter( 'wpbs_preload_images', function ( $images ) use ( $attributes ) {

			return array_replace( [], $images, $attributes['wpbs-preload'] ?? [] );

		} );

		add_filter( 'wpbs_critical_css', function ( $css_array ) use ( $attributes, $custom_css, $css ) {

			if ( empty( $attributes['uniqueId'] ) || empty( $attributes['wpbs-css'] ) ) {
				return $css_array;
			}

			$css_array[ $attributes['uniqueId'] ] = $css;

			if ( ! empty( $custom_css ) ) {
				$css_array[ $attributes['uniqueId'] . '-custom' ] = $custom_css;
			}

			return $css_array;
		} );

		if ( $is_rest ) {
			echo '<style>' . join( ' ', array_filter( [ $css, $custom_css ] ) ) . '</style>';

			return true;
		} else {
			return join( ' ', array_filter( [ $css, $custom_css ] ) );
		}
	}

	public function render_block( $attributes, $content ): string {

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


