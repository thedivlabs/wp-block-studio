<?php

$settings = $block->attributes['wpbs-page-title'] ?? [];
$type     = $settings['type'] ?? false;

$title = match ( $type ) {
	'single' => is_singular() ? get_the_title() : false,
	'archive' => is_post_type_archive() ? get_post_type_object( get_post_type() )->label ?? false : false,
	'term' => is_tax() ? get_queried_object()->label ?? false : false,
	'taxonomy' => is_tax() ? get_taxonomy( get_term( get_queried_object()->term_id ?? false )->taxonomy ?? false )->label ?? false : false,
	default => false,
} ?: match ( true ) {
	is_singular() => get_the_title(),
	is_post_type_archive() => get_post_type_object( get_post_type() )->label ?? false,
	is_tax() => get_queried_object()->label ?? false,
	default => false,
};

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