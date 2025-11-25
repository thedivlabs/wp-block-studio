<?php
/**
 * render.php — FINAL VERSION for JSON placeholders
 *
 * Handles only FEATURED IMAGE replacement:
 * Replaces %%_FEATURED_JSON_{base64}%% with the correct URL
 * based on decoded JSON: { isMobile: bool, resolution: string }
 *
 * Responsive picture logic, breakpoints, resolutions, fallbacks
 * across device sizes, etc. are now handled entirely in JS.
 */

if ( empty( $content ) ) {
	return;
}

$post_id = get_the_ID();

/**
 * Detect all FEATURED_JSON placeholders
 */
if ( ! preg_match_all( '/%%_FEATURED_JSON_([^%]+)%%/', $content, $matches, PREG_SET_ORDER ) ) {
	echo $content;
	return;
}

$has_featured = has_post_thumbnail( $post_id );
$featured_id  = $has_featured ? get_post_thumbnail_id( $post_id ) : null;

/**
 * Get Featured Image ALT
 */
$featured_alt = '';
if ( $featured_id ) {
	$featured_alt = get_post_meta( $featured_id, '_wp_attachment_image_alt', true );
}
if ( empty( $featured_alt ) ) {
	$featured_alt = get_the_title( $post_id );
}

/**
 * Loop through each placeholder and replace it
 */
foreach ( $matches as $match ) {

	$fullToken = $match[0];
	$encoded   = $match[1];

	// Decode JSON
	$json = base64_decode( $encoded );
	$data = json_decode( $json, true );

	if ( ! is_array( $data ) ) {
		$content = str_replace( $fullToken, '#', $content );
		continue;
	}

	$is_mobile  = ! empty( $data['isMobile'] );
	$resolution = $data['resolution'] ?? 'large';

	// Determine which WP size to load based on isMobile
	$wp_size = $is_mobile ? $resolution : $resolution;

	// ------------------------------------------------------------
	// Fetch URL
	// ------------------------------------------------------------
	$url = '';

	if ( $featured_id ) {
		$url = wp_get_attachment_image_url( $featured_id, $wp_size );
	}

	// If nothing found, fallback to "#"
	if ( empty( $url ) ) {
		$url = '#';
	}

	// Replace placeholder with actual URL
	$content = str_replace( $fullToken, esc_url( $url ), $content );
}

/**
 * Replace ALT placeholder (same as before)
 */
$content = str_replace(
	'%%_FEATURED_ALT_%%',
	esc_attr( $featured_alt ),
	$content
);

echo $content;