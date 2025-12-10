<?php

$context    = $block->context ?? [];
$settings   = $context['wpbs/query'] ?? [];
$media_item = $context['wpbs/media'] ?? null;

// Detect loop/gallery/lightbox mode
$is_dynamic = $media_item !== null || wp_is_json_request();

// Wrapper attributes
$wrapper = get_block_wrapper_attributes( [
	'class'      => implode( ' ', array_filter( [
		'wpbs-slide swiper-slide',
		$attributes['uniqueId'] ?? ''
	] ) ),
	'data-index' => $context['wpbs/index'] ?? null,
] );

echo "<div {$wrapper}>";

// -----------------------------------------
// Media renderer
// -----------------------------------------
$media = new WPBS_Media( $media_item, $settings );
echo $media->render();

// -----------------------------------------
// Dynamic mode (loop/lightbox/gallery)
// -----------------------------------------
if ( $is_dynamic ) {

	// Render inner blocks normally (loop inserts them)
	foreach ( $block->parsed_block['innerBlocks'] as $inner_block ) {
		echo render_block( $inner_block );
	}

	echo "</div>";

	return;
}

// -----------------------------------------
// Normal mode: use saved markup closing tag
// -----------------------------------------

// Render inner blocks
foreach ( $block->parsed_block['innerBlocks'] as $inner_block ) {
	echo render_block( $inner_block );
}

// Replace placeholders in saved closing tag
$closing = $block->parsed_block['innerHTML'] ?? '';

if ( $closing ) {

	// Post link replacement
	if ( ! empty( $context['wpbs/postId'] ) ) {
		$closing = str_replace(
			'%%__POST_LINK_URL__%%',
			esc_url( get_permalink( (int) $context['wpbs/postId'] ) ),
			$closing
		);
	}

	// Term link replacement
	if ( ! empty( $context['wpbs/termId'] ) ) {
		$term_link = get_term_link( (int) $context['wpbs/termId'] );
		if ( ! is_wp_error( $term_link ) ) {
			$closing = str_replace(
				'%%__TERM_LINK_URL__%%',
				esc_url( $term_link ),
				$closing
			);
		}
	}

	echo $closing;
}
