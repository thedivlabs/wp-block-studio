<?php
/**
 * render.php — FEATURED IMAGE JSON placeholder handler
 *
 * Replaces tokens of the form:
 *   %%_FEATURED_JSON_{base64}%%
 * where base64 decodes to a JSON object:
 *   { "isMobile": bool, "resolution": "large|medium|..." }
 *
 * Also replaces:
 *   %%_FEATURED_ALT_%%
 * with the featured image alt text.
 *
 * All responsive logic is handled in JS. PHP only swaps tokens for URLs.
 */

if ( empty( $content ) ) {
	return;
}

// If there is no placeholder, just echo content and bail early
if ( strpos( $content, '%%_FEATURED_JSON_' ) === false && strpos( $content, '%%_FEATURED_ALT_%%' ) === false ) {
	echo $content;

	return;
}

global $post;

// We need a post context to read the featured image
if ( ! $post instanceof WP_Post ) {
	// Still strip the placeholders so nothing weird leaks
	$content = preg_replace( '/%%_FEATURED_JSON_[^%]+%%/', '', $content );
	$content = str_replace( '%%_FEATURED_ALT_%%', '', $content );
	echo $content;

	return;
}

// Base featured image
$featured_id  = get_post_thumbnail_id( $post );
$featured_alt = $featured_id
	? get_post_meta( $featured_id, '_wp_attachment_image_alt', true )
	: '';

// Optional mobile featured image, e.g. ACF field
$featured_mobile_id = 0;
if ( function_exists( 'get_field' ) ) {
	$mobile_id = get_field( 'page_settings_media_featured_image_mobile', $post->ID );
	if ( $mobile_id ) {
		$featured_mobile_id = (int) $mobile_id;
	}
}

// ------------------------------------------------------------------
// Replace URL placeholders
// ------------------------------------------------------------------

if ( preg_match_all( '/%%_FEATURED_JSON_([^%]+)%%/', $content, $matches, PREG_SET_ORDER ) ) {
	foreach ( $matches as $match ) {
		$full_token   = $match[0];
		$encoded_json = $match[1];

		$decoded = base64_decode( $encoded_json, true );
		if ( false === $decoded ) {
			// Remove bad token
			$content = str_replace( $full_token, '', $content );
			continue;
		}

		$payload = json_decode( $decoded, true );
		if ( ! is_array( $payload ) ) {
			$content = str_replace( $full_token, '', $content );
			continue;
		}

		$is_mobile  = ! empty( $payload['isMobile'] );
		$resolution = ! empty( $payload['resolution'] ) ? $payload['resolution'] : 'large';

		// Pick which attachment ID to use
		$image_id = $is_mobile && $featured_mobile_id ? $featured_mobile_id : $featured_id;

		if ( ! $image_id ) {
			// No image available; strip token
			$content = str_replace( $full_token, '', $content );
			continue;
		}

		// Try size-specific URL first
		$url = wp_get_attachment_image_url( $image_id, $resolution );

		// Fallback to original attachment URL
		if ( ! $url ) {
			$url = wp_get_attachment_url( $image_id );
		}

		if ( ! $url ) {
			$content = str_replace( $full_token, '', $content );
			continue;
		}

		$content = str_replace( $full_token, esc_url( $url ), $content );
	}
}

// ------------------------------------------------------------------
// Replace ALT placeholder
// ------------------------------------------------------------------

if ( strpos( $content, '%%_FEATURED_ALT_%%' ) !== false ) {
	$alt     = (string) $featured_alt;
	$content = str_replace( '%%_FEATURED_ALT_%%', esc_attr( $alt ), $content );
}

echo $content;
