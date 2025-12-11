<?php
declare( strict_types=1 );

$content = $content ?? '';


$settings   = $block->context['wpbs/query'] ?? [];
$media_item = $block->context['wpbs/media'] ?? null;
$index      = $block->context['wpbs/index'] ?? null;


$is_gallery = ! empty( $attributes['isGallery'] );
$is_loop    = ! empty( $attributes['isLoop'] );

$is_lightbox = wp_is_json_request();


if ( ! $is_gallery ) {
	echo $content;

	return;
}

if ( $is_loop ) {

	if ( ! empty( $block->context['wpbs/termId'] ) ) {
		$term_link = get_term_link( (int) $block->context['wpbs/termId'] );
		if ( ! is_wp_error( $term_link ) ) {
			$content = str_replace( '%%__TERM_LINK_URL__%%', esc_url( $term_link ), $content );
		}
	}

	if ( ! empty( $block->context['wpbs/postId'] ) ) {
		$post_link = get_permalink( (int) $block->context['wpbs/postId'] );
		$content   = str_replace( '%%__POST_LINK_URL__%%', esc_url( $post_link ), $content );
	}
}


$wrapper_props = get_block_wrapper_attributes( array_filter( [
	'class' => join( ' ', array_filter( [
		'wpbs-loop-card grid-card',
		$attributes['uniqueId'] ?? null,
		'w-full block relative',
	] ) ),
] ) );


$closing = '</div>';

if ( ! $is_gallery && ! $is_lightbox ) {
	echo $content;

	return;
}

echo '<div ' . $wrapper_props . '>';

/**
 * ALWAYS PRINT MEDIA FIRST
 */
if ( $is_gallery || $is_lightbox ) {
	$media = new WPBS_Media( $media_item, $settings, $index );
	echo $media->render();
}


// Close wrapper
echo $closing;
