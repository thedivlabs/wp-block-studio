<?php
/**
 * Render.php
 * * Replaces placeholders from block.js with actual Featured Image data.
 */

$settings = $attributes['wpbs-figure'] ?? [];

if ( empty( $content ) ) {
	return;
}

// 1. Get the current Post ID
$post_id = get_the_ID();

// 2. Initialize variables
$img_large_url  = '';
$img_mobile_url = '';
$img_alt        = '';

// 3. Logic: Fetch Featured Image Data
// Check if we have a standard featured image OR an ACF mobile override
if ( has_post_thumbnail( $post_id ) || ( function_exists( 'get_field' ) && get_field( 'page_settings_media_mobile_image' ) ) ) {

	// A. GET LARGE IMAGE (Standard Featured Image)
	// Uses the block setting 'resolutionLarge' (e.g., 'full', 'large') or defaults to 'large'
	$img_large_url = get_the_post_thumbnail_url( $post_id, $settings['resolutionLarge'] ?? 'large' );

	// B. GET MOBILE IMAGE
	// Priority 1: Check ACF Field 'page_settings_media_mobile_image'
	if ( function_exists( 'get_field' ) ) {
		$acf_mobile_id = get_field( 'page_settings_media_mobile_image' );
		if ( $acf_mobile_id ) {
			$img_mobile_url = wp_get_attachment_image_url(
				$acf_mobile_id,
				$settings['resolutionMobile'] ?? 'medium_large'
			);
		}
	}

	// Priority 2: If ACF is empty, use Standard Featured Image at Mobile Resolution
	if ( empty( $img_mobile_url ) ) {
		$img_mobile_url = get_the_post_thumbnail_url(
			$post_id,
			$settings['resolutionMobile'] ?? 'medium_large'
		);
	}

	// Priority 3: Final Fallback (use Large URL)
	if ( empty( $img_mobile_url ) ) {
		$img_mobile_url = $img_large_url;
	}

	// C. GET ALT TEXT
	// We default to the standard featured image alt text
	$thumbnail_id = get_post_thumbnail_id( $post_id );
	$img_alt      = get_post_meta( $thumbnail_id, '_wp_attachment_image_alt', true );

	// Fallback Alt if empty (uses post title)
	if ( empty( $img_alt ) ) {
		$img_alt = get_the_title( $post_id );
	}
}

// 4. Perform String Replacement
$replacements = [
	'%%_FEATURED_IMAGE_LARGE_%%'  => esc_url( $img_large_url ),
	'%%_FEATURED_IMAGE_MOBILE_%%' => esc_url( $img_mobile_url ),
	'%%_FEATURED_ALT_%%'          => esc_attr( $img_alt ),
];

$content = str_replace( array_keys( $replacements ), array_values( $replacements ), $content );

// 5. Output
echo $content;