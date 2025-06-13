<?php

class WPBS_WP {

	private static WPBS_WP $instance;

	private function __construct() {

		$this->image_sizes();

		add_action( 'intermediate_image_sizes', [ $this, 'remove_default_image_sizes' ], 100 );
		add_action( 'after_setup_theme', [ $this, 'theme_support' ], 100 );
		add_filter( 'upload_mimes', [ $this, 'add_media_library_mime_types' ] );

		register_nav_menus( array(
			'header-menu' => __( 'Header Menu', 'divlabs' ),
			'mega-menu'   => __( 'Mega Menu', 'divlabs' ),
			'mobile-menu' => __( 'Mobile Menu', 'divlabs' ),
			'footer-menu' => __( 'Footer Menu', 'divlabs' ),
			'legal-menu'  => __( 'Legal Menu', 'divlabs' ),
		) );

		add_post_type_support( 'page', 'excerpt' );

		add_filter( 'mce_buttons_2', [ $this, 'mce_buttons' ] );
		add_filter( 'tiny_mce_before_init', [ $this, 'mce_init' ] );

		$this->shortcodes();

		add_filter( 'rest_endpoints', [ $this, 'add_rest_method' ] );

	}

	public function theme_support(): void {

		add_theme_support( 'custom-spacing' );
		add_theme_support( 'custom-units' );
		add_theme_support( 'block-template-parts' );
		add_theme_support( 'core-block-patterns' );
		add_theme_support( 'custom-background' );
		add_theme_support( 'editor-styles' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'appearance-tools' );
		add_theme_support( 'wp-block-styles' );
		add_theme_support( 'border' );
		//add_theme_support( 'editor-color-palette' );
		//add_theme_support( 'editor-gradient-presets' );

	}

	public function add_rest_method( $endpoints ) {
		if ( is_wp_version_compatible( '5.5' ) ) {
			return $endpoints;
		}

		foreach ( $endpoints as $route => $handler ) {
			if ( isset( $endpoints[ $route ][0] ) ) {
				$endpoints[ $route ][0]['methods'] = [ WP_REST_Server::READABLE, WP_REST_Server::CREATABLE ];
			}
		}

		return $endpoints;
	}

	public function shortcodes(): void {
		add_shortcode( 'current-year', function ( $attributes ) {

			$attributes = shortcode_atts( [
				'format' => 'Y'
			], $attributes );

			return date( $attributes['format'] );
		} );
	}


	public function mce_buttons( $buttons ) {

		array_unshift( $buttons, 'fontsizeselect' );
		array_unshift( $buttons, 'styleselect' );

		return $buttons;
	}

	public function mce_init( $init_array ) {

		$global_styles = wp_get_global_styles()['elements'] ?? false;

		$init_array['fontsize_formats'] = "14px 16px 18px 21px 24px 28px 32px 36px 40px 42px 48px 52px 56px 60px 72px";

		$colors = wp_get_global_settings()['color']['palette'] ?? [];

		$default_colors = ' ' . implode( ', ', array_map( function ( $theme_color ) {
				return '"' . str_replace( '#', '', $theme_color['color'] ) . '", "' . $theme_color['name'] . '"';
			}, $colors['default'] ?? [] ) ) . ' ';

		$theme_colors = ' ' . implode( ', ', array_map( function ( $theme_color ) {
				return '"' . str_replace( '#', '', $theme_color['color'] ) . '", "' . $theme_color['name'] . '"';
			}, $colors['theme'] ?? [] ) ) . ' ';

		$init_array['textcolor_map']  = '[' . $theme_colors . ',' . $default_colors . ']';
		$init_array['textcolor_rows'] = 1 + ( ( count( $colors['default'] ?? [] ) + count( $colors['theme'] ?? [] ) ) / 8 );


		$style_formats = [
			[
				'title'   => 'H1',
				'inline'  => 'span',
				'wrapper' => false,
				'styles'  => array_filter( [
					'display'     => 'inline-block',
					'font-size'   => $global_styles['h1']['typography']['fontSize'] ?? null,
					'line-height' => $global_styles['h1']['typography']['lineHeight'] ?? $global_styles['heading']['typography']['lineHeight'] ?? null,
				] ),
			],
			[
				'title'   => 'H2',
				'inline'  => 'span',
				'wrapper' => false,
				'styles'  => array_filter( [
					'display'     => 'inline-block',
					'font-size'   => $global_styles['h2']['typography']['fontSize'] ?? 'inherit',
					'line-height' => $global_styles['h2']['typography']['lineHeight'] ?? $global_styles['heading']['typography']['lineHeight'] ?? 'normal',
				] ),
			],
			[
				'title'   => 'H3',
				'inline'  => 'span',
				'wrapper' => false,
				'styles'  => array_filter( [
					'display'     => 'inline-block',
					'font-size'   => $global_styles['h3']['typography']['fontSize'] ?? 'inherit',
					'line-height' => $global_styles['h3']['typography']['lineHeight'] ?? $global_styles['heading']['typography']['lineHeight'] ?? 'normal',
				] ),
			],
			[
				'title'   => 'H4',
				'inline'  => 'span',
				'wrapper' => false,
				'styles'  => array_filter( [
					'display'     => 'inline-block',
					'font-size'   => $global_styles['h4']['typography']['fontSize'] ?? 'inherit',
					'line-height' => $global_styles['h4']['typography']['lineHeight'] ?? $global_styles['heading']['typography']['lineHeight'] ?? 'normal',
				] ),
			],
			[
				'title'   => 'Leading Tight',
				'inline'  => 'span',
				'wrapper' => false,
				'styles'  => array_filter( [
					'line-height' => '1.3',
				] ),
			],
			[
				'title'   => 'Leading Normal',
				'inline'  => 'span',
				'wrapper' => false,
				'styles'  => array_filter( [
					'line-height' => 'normal',
				] ),
			],
			[
				'title'   => 'Leading Loose',
				'inline'  => 'span',
				'wrapper' => false,
				'styles'  => array_filter( [
					'line-height' => '1.7',
				] ),
			],
		];

		$init_array['style_formats'] = wp_json_encode( $style_formats );

		return $init_array;
	}

	public function add_media_library_mime_types( $types ) {
		$types['json'] = 'text/plain';

		return $types;
	}

	public function remove_default_image_sizes( $sizes ): array {

		foreach ( $sizes as $k => $size ) {
			if ( ! in_array( $size, [ 'thumbnail', 'mobile', 'small', 'medium', 'large', 'xlarge', 'email' ] ) ) {
				unset( $sizes[ $k ] );
			}
		}

		return $sizes;
	}

	public function image_sizes(): void {

		/*
		 * Recommended Sizes
		 *
		 * xlarge:      1800
		 * large:       1500
		 * medium:      1100
		 * small:       520
		 * mobile:      620x1200
		 * thumbnail:   200
		 *
		 * */

		add_image_size( 'xlarge', 1800 );
		add_image_size( 'small', 640 );
		add_image_size( 'medium', 1128 );
		add_image_size( 'mobile', 624, 1200 );

	}

	public static function init(): WPBS_WP {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_WP();
		}

		return self::$instance;
	}


}


