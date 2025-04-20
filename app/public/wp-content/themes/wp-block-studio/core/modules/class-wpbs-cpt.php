<?php

class WPBS_CPT {

	private static WPBS_CPT $instance;

	private function __construct() {

	}

	public static function init(): WPBS_CPT {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_CPT();
		}

		return self::$instance;
	}

	public static function register( string $singular, string $plural, $slug = false, $args = [], $labels = [], bool $options_page = false, bool $search = false, bool $redirect_single = false, bool $public = true ): void {

		$slug = sanitize_title( $slug === false ? $singular : $slug );

		$singular_name = $labels['singular_name'] ?? $singular;

		if ( is_array( $args['template'] ?? false ) ) {
			$args['template'] = array_map( function ( $slug ) {
				return [
					$slug,
					[
						'lock' => [
							'move'   => false,
							'remove' => true
						]
					]
				];
			}, $args['template'] );
		}

		$default_labels = [
			'name'               => _x( $plural, 'Post Type General Name', 'wpbs' ),
			'singular_name'      => _x( $singular_name, 'Post Type Singular Name', 'wpbs' ),
			'menu_name'          => __( $plural, 'wpbs' ),
			'parent_item_colon'  => __( "Parent {$singular_name}", 'wpbs' ),
			'all_items'          => __( "All {$plural}", 'wpbs' ),
			'view_item'          => __( "View {$singular_name}", 'wpbs' ),
			'add_new_item'       => __( "Add New {$singular_name}", 'wpbs' ),
			'add_new'            => __( 'Add New', 'wpbs' ),
			'edit_item'          => __( "Edit {$singular_name}", 'wpbs' ),
			'update_item'        => __( "Update {$singular_name}", 'wpbs' ),
			'search_items'       => __( "Search {$singular_name}", 'wpbs' ),
			'not_found'          => __( 'Not Found', 'wpbs' ),
			'not_found_in_trash' => __( 'Not found in Trash', 'wpbs' ),
		];

		$labels = is_array( $labels ?? false ) ? array_merge( [], $default_labels, $labels ) : $default_labels;

		$default_args = [
			'label'               => __( $slug, 'wpbs' ),
			'labels'              => $labels,
			'redirect_single'     => $redirect_single,
			'supports'            => array(
				'title',
				'editor',
				'author',
				'attributes',
				'excerpt',
				'thumbnail'
			),
			'hierarchical'        => false,
			'public'              => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_nav_menus'   => true,
			'show_in_admin_bar'   => true,
			'menu_position'       => 5,
			'can_export'          => true,
			'has_archive'         => true,
			'exclude_from_search' => false,
			'publicly_queryable'  => true,
			'capability_type'     => 'post',
			'show_in_rest'        => true,
			'rewrite'             => [ 'with_front' => false ]
		];

		if ( ! $public ) {
			$default_args = array_merge( $default_args, [
				'public'              => false,
				'publicly_queryable'  => true,
				'show_ui'             => true,
				'exclude_from_search' => true,
				'show_in_nav_menus'   => false,
				'has_archive'         => false,
				'rewrite'             => false,
			] );
		}

		$args = is_array( $args ?? false ) ? array_merge( $default_args, $args ) : $default_args;

		register_post_type( $slug, $args );

		if (
			! empty( $options_page ) &&
			function_exists( 'acf_add_options_page' )
		) {
			acf_add_options_page( array(
				'page_title'  => implode( ' ', array_filter( [
					$labels['plural_name'] ?? $labels['name'] ?? null
				] ) ),
				'menu_title'  => 'Options',
				'menu_slug'   => implode( '-', [
					$slug,
					'options'
				] ),
				'capability'  => 'edit_posts',
				'redirect'    => false,
				'parent_slug' => 'edit.php?post_type=' . $slug
			) );
		}

		if ( $search ) {

			add_action( 'pre_get_posts', function ( $query ) use ( $slug, $search ) {

				if (
					$query->is_main_query() &&
					$query->is_search() &&
					! is_admin() &&
					is_post_type_archive( $slug )
				) {

					$query->set( 'post_type', $slug );
				}

			}, 30 );
		}

	}


}

