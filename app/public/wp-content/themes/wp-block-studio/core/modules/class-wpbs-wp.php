<?php

class WPBS_WP {

	private static WPBS_WP $instance;

	private function __construct() {

		$this->image_sizes();

		add_action( 'intermediate_image_sizes', [ $this, 'remove_default_image_sizes' ], 100 );
		add_filter( 'nav_menu_link_attributes', 'menu_item_icon', 10, 4 );


		register_nav_menus( array(
			'header-menu' => __( 'Header Menu', 'divlabs' ),
			'mega-menu'   => __( 'Mega Menu', 'divlabs' ),
			'mobile-menu' => __( 'Mobile Menu', 'divlabs' ),
			'footer-menu' => __( 'Footer Menu', 'divlabs' ),
			'legal-menu'  => __( 'Legal Menu', 'divlabs' ),
		) );

		$this->shortcodes();
		$this->theme_support();


	}


	public function menu_item_icon( $attrs, $item, $args, $depth ): array {


		$icon = get_field( 'icon', $item );

		if ( ! empty( $icon ) ) {

			$attrs['class'] = join( ' ', array_filter( [
				trim( $attrs['class'] ?? '' ),
				'--icon'
			] ) );

			$attrs['style'] = join( '; ', array_filter( [
					rtrim( trim( $attrs['style'] ?? '' ), ';' ),
					'--icon: "\\' . esc_attr( $icon )
				] ) ) . '";';

		}

		return $attrs;
	}

	public function theme_support(): void {

		add_post_type_support( 'page', 'excerpt' );

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
		add_theme_support( 'menus' );
		//add_theme_support( 'editor-color-palette' );
		//add_theme_support( 'editor-gradient-presets' );

		register_block_style( 'core/navigation', [
			'name'  => 'accordion',
			'label' => 'Accordion',
		] );

	}

	public function shortcodes(): void {
		add_shortcode( 'current-year', function ( $attributes ) {

			$attributes = shortcode_atts( [
				'format' => 'Y'
			], $attributes );

			return date( $attributes['format'] );
		} );
	}

	public function remove_default_image_sizes( $sizes ): array {

		foreach ( $sizes as $k => $size ) {
			if ( ! in_array( $size, [ 'thumbnail', 'mobile', 'small', 'medium', 'large', 'xlarge' ] ) ) {
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
		add_image_size( 'medium', 1130 );
		add_image_size( 'mobile', 624, 1200 );

	}

	public static function init(): WPBS_WP {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_WP();
		}

		return self::$instance;
	}


}


