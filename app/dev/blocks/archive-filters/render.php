<?php

global $wp_query;

WPBS::console_log( $wp_query );

$settings        = $block->attributes['wpbs-archive-filters'] ?? [];
$type            = $settings['type'] ?? false;
$search_value    = isset( $_GET['s'] ) ? esc_attr( $_GET['s'] ) : '';
$sort_value      = isset( $_GET['sort'] ) ? esc_attr( $_GET['sort'] ) : '';
$current_term_id = get_queried_object()->term_id ?? '';

$post_type          = get_post_type_object( ( get_query_var( 'post_type' ) ?: 'post' ) );
$current_taxonomies = array_filter( get_object_taxonomies( $post_type->name ?? false, 'objects' ), function ( $tax ) {
	return is_a( $tax, 'WP_Taxonomy' ) && $tax->public && $tax->hierarchical;
} );

WPBS::console_log( $current_term_id );
WPBS::console_log( $current_taxonomies );

$search  = [ '#--SEARCH--#', '#--SORT--#', '#--TERMS--#' ];
$replace = [ $search_value, $sort_value, $current_term_id ];

if ( $type == 'terms' ) {

	$options = join( '\r\n', array_values( array_filter( array_map( function ( $tax ) {

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

		$result = '<option value="taxonomy-' . $tax->name . '" disabled>' . ( $tax->label ?? $tax->name ) . '</option>';

		foreach ( $terms as $term ) {
			$result .= '<option value="' . $term->term_id . '">' . ( $term->name ) . '</option>';
		}

		return trim( $result );


	}, $current_taxonomies ) ) ) );

	$search[]  = '</select>';
	$replace[] = join( '\r\n', [ $options, '</select>' ] );
}

echo str_replace( $search, $replace, $content ?? '' );
