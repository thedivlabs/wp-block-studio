<?php

global $wp_query;

$attributes = $attributes ?? [];
$block      = $block ?? ( (object) [] );
$content    = $content ?? false;
$context    = [
	'uniqueId' => $attributes['uniqueId'] ?? false,
	'postId'   => $attributes['postId'] ?? false,
];
$clientId   = $attributes['clientId'] ?? false;

$selector = match ( true ) {
	! empty( $attributes['uniqueId'] ) => '.' . join( '.', explode( ' ', $attributes['uniqueId'] ) ),
	! empty( $attributes['className'] ) => '.' . join( '.', explode( ' ', $attributes['className'] ) ),
	default => false
};


$css = WPBS_Style::block_styles( $attributes ?? false, $block ?? false );


echo join( '', [
	'<div ',
	get_block_wrapper_attributes(),
	'data-wp-init="callbacks.init"',
	'data-wp-interactive="wpbs/layout-grid-card"',
	'>',
] );

echo $content ?? '';

echo '</div>';