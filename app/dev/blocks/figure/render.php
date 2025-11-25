<?php

if ( empty( $content ) ) {
	return;
}
// --------------------------------------------------------------
// Replace FEATURED IMAGE placeholders before echoing content
// --------------------------------------------------------------

// 1. DESKTOP FEATURED IMAGE
$block_content = preg_replace_callback(
	'/%%__FEATURED_IMAGE__([A-Z0-9_-]+)__%%/',
	function ( $match ) {

		// Extract resolution from placeholder
		$size = strtolower( $match[1] );

		// Load featured image for the current post
		$url = get_the_post_thumbnail_url( null, $size );

		// If no featured image exists, remove placeholder
		if ( ! $url ) {
			return '';
		}

		return esc_url( $url );
	},
	$content
);


// 2. MOBILE FEATURED IMAGE
$block_content = preg_replace_callback(
	'/%%__FEATURED_IMAGE_MOBILE__([A-Z0-9_-]+)__%%/',
	function ( $match ) {

		$size = strtolower( $match[1] );

		// ACF mobile featured image field
		$mobile_id = get_field( 'page_settings_media_featured_image_mobile' );

		// Fallback to regular featured image if mobile doesn't exist
		if ( ! $mobile_id ) {
			$fallback = get_the_post_thumbnail_url( null, $size );

			return $fallback ? esc_url( $fallback ) : '';
		}

		$url = wp_get_attachment_image_url( $mobile_id, $size );

		return $url ? esc_url( $url ) : '';
	},
	$content
);


// --------------------------------------------------------------
// Output the final processed HTML
// --------------------------------------------------------------
echo $block_content;
