<?php

//WPBS::console_log( $block );
//WPBS::console_log( [ $content ?? '' ] );

echo $content;

return;

$settings   = $block->context['wpbs/query'] ?? [];
$media_item = $block->context['wpbs/media'] ?? null;

$is_gallery  = ! empty( $attributes['isGallery'] );
$is_loop     = ! empty( $attributes['isLoop'] );
$is_lightbox = wp_is_json_request();

$content = $content ?? '';

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
	'class'      => join( ' ', array_filter( [
		'wpbs-slide swiper-slide',
		$block->attributes['uniqueId'] ?? null,
		'w-full flex',
	] ) ),
	'data-index' => $block->context['wpbs/index'] ?? null
] ) );


echo '<div ' . $wrapper_props . '>';

$wrapper_tags = WPBS::extract_tag_wrappers( $content ?? '' );

$closing = $wrapper_tags['closing'];

/**
 * ALWAYS PRINT MEDIA FIRST
 */
if ( $is_gallery || $is_lightbox ) {
	$media = new WPBS_Media( $media_item, $settings );
	//echo $media->render();
}

/**
 * LIGHTBOX MODE → close early
 */
if ( $is_lightbox ) {
	echo $closing;

	return;
}

/**
 * GALLERY MODE → media only
 */
if ( $is_gallery ) {
	echo $closing;

	return;
}

/**
 * NORMAL FRONT-END BLOCK OUTPUT
 */
echo $content ?? '';

// Close wrapper
echo $closing;
