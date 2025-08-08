<?php


final class WPBS_Taxonomy {

	private function __construct() {

	}

	public static function register( string $singular, string $plural, string|array $cpt, string|bool $slug = false, array|bool $args = [], array|bool $labels = [] ): void {

		if ( empty( $singular ) || empty( $plural ) || empty( $cpt ) ) {
			return;
		}

		$slug = sanitize_title( $slug ?: $singular );

		$default_labels = [
			'name'              => $plural,
			'singular_name'     => $singular,
			'menu_name'         => $plural,
			'search_items'      => __( "Search {$plural}" ),
			'all_items'         => __( "All {$plural}" ),
			'parent_item'       => __( "Parent {$singular}" ),
			'parent_item_colon' => __( "Parent {$singular}:" ),
			'edit_item'         => __( "Edit {$singular}" ),
			'update_item'       => __( "Update {$singular}" ),
			'add_new_item'      => __( "Add New {$singular}" ),
			'new_item_name'     => __( "New {$singular} Name" ),
		];

		$labels = is_array( $labels ) ? array_merge( $default_labels, array_filter( $labels ) ) : $default_labels;

		$default_args = [
			'hierarchical'      => true,
			'label'             => $plural,
			'labels'            => $labels,
			'show_ui'           => true,
			'show_in_rest'      => true,
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => [
				'slug'       => $slug,
				'with_front' => false,
			]
		];

		$args = is_array( $args ) ? array_merge( $default_args, array_filter( $args ) ) : $default_args;

		$taxonomy_object = register_taxonomy( $slug, (array) $cpt, $args );


	}


}
