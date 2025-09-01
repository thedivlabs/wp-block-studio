<?php

$settings = $block->attributes['wpbs-page-title'] ?? [];
$type     = $settings['type'] ?? false;
$title    = empty( $type ) ? null : match ( $type ) {
	'single' => is_singular() ? get_the_title() : $settings['default'] ?? null,
	'term' => is_category() || is_tag() || is_tax() ? get_queried_object()->name ?? null : $settings['default'] ?? null,
	'archive' => is_home() || get_post_type() == 'post' ? get_the_title( get_option( 'page_for_posts' ) ) : get_post_type_object( get_post_type() )->labels->archives ?? $settings['default'] ?? null,
	'taxonomy' => get_taxonomy( get_queried_object()->taxonomy )->label ?? $settings['default'] ?? null,
	default => $settings['default'] ?? null,
};

// If on singular (posts, pages, CPTs)
if ( is_singular() ) {
	return get_the_title();
}

// Blog home (posts page)
if ( is_home() ) {

	// If a static page is set as "Posts page"
	$posts_page_id = get_option( 'page_for_posts' );
	if ( $posts_page_id ) {
		$title = $title ?? get_the_title( $posts_page_id );
	} else {
		$title = $title ?? __( 'Blog', 'wpbs' );
	}

}

// Search results
if ( is_search() ) {
	$title = $title ?? sprintf( __( 'Search Results for "%s"', 'wpbs' ), get_search_query() );
}

// Author archive
if ( is_author() ) {
	$title = $title ?? sprintf( __( 'Articles by %s', 'wpbs' ), get_the_author_meta( 'display_name', get_query_var( 'author' ) ) );
}

// Category / Tag / Custom taxonomy
if ( is_category() || is_tag() || is_tax() ) {
	$taxonomy = $settings['taxonomy'] ?? get_queried_object()->taxonomy;
	$term     = get_queried_object();
	if ( $term && ! is_wp_error( $term ) ) {
		$title = $title ?? $term->name;
	}
}

// Post type archive
if ( is_post_type_archive() ) {
	$title = $title ?? post_type_archive_title( '', false );
}

// Date archive
if ( is_date() ) {
	if ( is_day() ) {
		$title = $title ?? get_the_date();
	} elseif ( is_month() ) {
		$title = $title ?? get_the_date( 'F Y' );
	} elseif ( is_year() ) {
		$title = $title ?? get_the_date( 'Y' );
	}
}

// Fallback: queried object title (should catch most cases)
$title = empty( $title ) ? $settings['default'] ?? single_post_title( '', false ) : $title;

if ( ! $title ) {
	$obj = get_queried_object();
	if ( $obj && ! empty( $obj->label ) ) {
		$title = $obj->label;
	}
}

if ( empty( $title ) ) {
	return false;
}

$link = ! empty( $settings['link'] ) ? match ( $type ) {
	'single' => get_the_permalink(),
	'archive' => get_post_type_archive_link( get_queried_object()->post_type ?? false ),
	'term' => get_term_link( get_queried_object()->term_id ?? false ),
	default => false,
} : false;

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-services-content',
		$attributes['uniqueId'] ?? ''
	] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );

$element_tag = $attributes['wpbs-element-tag'] ?? 'div';

echo '<' . $element_tag . ' ' . $wrapper_attributes . '>';

if ( $link ) {
	echo '<a href="' . $link . '">';
}

echo $title;

if ( $link ) {
	echo '</a>';
}

echo '</' . $element_tag . '>';