<?php

$settings        = $block->attributes['wpbs-archive-filters'] ?? [];
$type            = $settings['type'] ?? false;
$search_value    = isset( $_GET['s'] ) ? esc_attr( $_GET['s'] ) : '';
$sort_value      = isset( $_GET['sort'] ) ? esc_attr( $_GET['sort'] ) : '';
$current_term_id = get_queried_object()->term_id ?? '';


WPBS::console_log( get_queried_object() );
WPBS::console_log( $current_term_id );

$search  = [ '#--SEARCH--#', '#--SORT--#', '#--TERMS--#' ];
$replace = [ $search_value, $sort_value, $current_term_id ];

if ( $type == 'terms' ) {
	$search[] = '</select>';
}

echo str_replace( $search, $replace, $content ?? '' );
