<?php

$settings        = $block->attributes['wpbs-archive-filters'] ?? [];
$type            = $settings['type'] ?? false;
$search_value    = isset( $_GET['s'] ) ? esc_attr( $_GET['s'] ) : '';
$sort_value      = isset( $_GET['sort'] ) ? esc_attr( $_GET['sort'] ) : '';
$current_term_id = get_queried_object()->term_id ?? '';

$post_type          = get_post_type_object( ( get_query_var( 'post_type' ) ?: 'post' ) );
$current_taxonomies = array_filter( ! empty( $settings['taxonomy'] ) ? [ get_taxonomy( $settings['taxonomy'] ) ] : get_object_taxonomies( $post_type->name ?? false, 'objects' ), function ( $tax ) {
	return is_a( $tax, 'WP_Taxonomy' ) && $tax->public && $tax->hierarchical;
} );

$search  = [ '#--SEARCH--#', '#--SORT--#', '#--TERMS--#' ];
$replace = [ $search_value, $sort_value, $current_term_id ];

if ( $type == 'terms' ) {

	$options = implode( "\r\n", array_values( array_filter( array_map( function ( $tax ) use ( $current_term_id ) {

		if ( empty( $tax->name ) ) {
			return null;
		}

		$terms = get_terms( [
			'taxonomy'   => $tax->name,
			'hide_empty' => true,
		] );

		if ( empty( $terms ) || is_wp_error( $terms ) ) {
			return null;
		}

		$result = '<optgroup label="' . esc_html( $tax->label ?? $tax->name ) . '">';

		foreach ( $terms as $term ) {

			$selected = $current_term_id == $term->term_id ? 'selected' : null;
			$result   .= implode( ' ', array_filter( [
				'<option',
				$selected,
				'value="' . esc_url( get_term_link( $term->term_id ) ) . '"',
				'>',
				esc_html( $term->name ),
				'</option>'
			] ) );
		}
		$result .= '</optgroup>';

		return $result;


	}, $current_taxonomies ) ) ) );

	$search[]  = '</select>';
	$replace[] = implode( "\r\n", [ $options, '</select>' ] );
}

echo str_replace( $search, $replace, $content ?? '' );
