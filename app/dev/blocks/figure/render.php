<?php

if ( empty( $content ) ) {
	return;
}

// --------------------------------------------------------------
// Replace FEATURED_IMAGE tokens (Base64 JSON)
// --------------------------------------------------------------

$block_content = preg_replace_callback(
	'/%%__FEATURED_IMAGE__([A-Za-z0-9+\/=]+)__%%/',
	function ( $matches ) {

		// --------------------------
		// Decode payload
		// --------------------------
		$b64  = $matches[1];
		$json = base64_decode( $b64 );
		if ( ! $json ) {
			return '';
		}

		$data = json_decode( $json, true );
		if ( ! is_array( $data ) ) {
			return '';
		}

		$mode       = $data['mode'] ?? null;
		$resolution = strtolower( $data['resolution'] ?? 'large' );
		$fallback   = $data['fallback'] ?? null;      // string URL

		$url = '';

		// ----------------------------------------------------------
		// FEATURED (desktop)
		// ----------------------------------------------------------
		if ( $mode === 'featured-image' ) {

			$url = get_the_post_thumbnail_url( null, $resolution );

			if ( ! $url && $fallback ) {
				$url = $fallback;
			}
		}

		// ----------------------------------------------------------
		// FEATURED-MOBILE (ACF)
		// ----------------------------------------------------------
		elseif ( $mode === 'featured-image-mobile' ) {

			$mobile_id = get_field( 'page_settings' )['media']['mobile_image'] ?? null;

			if ( $mobile_id ) {
				$url = wp_get_attachment_image_url( $mobile_id, $resolution );
			}

			// If no mobile → try desktop featured
			if ( ! $url ) {
				$url = get_the_post_thumbnail_url( null, $resolution );
			}

			// If nothing → fallback
			if ( ! $url && $fallback ) {
				$url = $fallback;
			}
		}

		// ----------------------------------------------------------
		// If no valid mode → fallback only
		// ----------------------------------------------------------
		if ( ! $url && $fallback ) {
			$url = $fallback;
		}

		return esc_url( $url ?: '' );
	},
	$content
);

echo $block_content;