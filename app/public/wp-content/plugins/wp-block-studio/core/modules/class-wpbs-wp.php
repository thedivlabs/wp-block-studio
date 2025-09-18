<?php

class WPBS_WP {

	private static WPBS_WP $instance;

	private function __construct() {

		add_filter( 'nav_menu_link_attributes', [ $this, 'menu_item_icon' ], 10, 4 );
		add_filter( 'walker_nav_menu_start_el', [ $this, 'menu_item_span' ], 10, 4 );

		register_nav_menus( array(
			'header-menu' => __( 'Header Menu', 'divlabs' ),
			'mega-menu'   => __( 'Mega Menu', 'divlabs' ),
			'mobile-menu' => __( 'Mobile Menu', 'divlabs' ),
			'footer-menu' => __( 'Footer Menu', 'divlabs' ),
			'legal-menu'  => __( 'Legal Menu', 'divlabs' ),
		) );

		$this->theme_support();

		add_action( 'pre_get_posts', [ $this, 'add_sort_query_string' ] );
	}

	public function add_sort_query_string( $query ): void {
		if ( ! is_admin() && $query->is_main_query() ) {
			$sort = $_GET['sort'] ?? '';

			switch ( $sort ) {
				case 'latest':
					$query->set( 'orderby', 'date' );
					$query->set( 'order', 'DESC' );
					break;
				case 'oldest':
					$query->set( 'orderby', 'date' );
					$query->set( 'order', 'ASC' );
					break;
				case 'title-asc':
					$query->set( 'orderby', 'title' );
					$query->set( 'order', 'ASC' );
					break;
				case 'title-desc':
					$query->set( 'orderby', 'title' );
					$query->set( 'order', 'DESC' );
					break;
			}
		}
	}

	public function menu_item_span( $item_output, $item, $depth, $args ): string {
		return preg_replace(
			'#(<a[^>]*>)(.*?)(</a>)#',
			'$1<span>$2</span>$3',
			$item_output
		);
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
					'--icon: "\\' . $icon . '"'
				] ) ) . ';';

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

		register_block_style(
			'core/paragraph',
			[
				'name'       => 'subtitle',
				'label'      => __( 'Subtitle', 'WPBS' ),
				'is_default' => false,
			]
		);

		register_block_style(
			'core/heading',
			[
				'name'       => 'small',
				'label'      => __( 'Small', 'WPBS' ),
				'is_default' => false,
			]
		);

	}


	public static function init(): WPBS_WP {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_WP();
		}

		return self::$instance;
	}


}


