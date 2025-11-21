<?php
/**
 * Render.php
 * Replaces placeholders from block.js with actual Featured Image data
 * and falls back to block-level imageLarge / imageMobile if needed.
 */

$settings = $attributes['wpbs-figure'] ?? [];

WPBS::console_log( $settings );

if ( empty( $content ) ) {
	return;
}

$post_id = get_the_ID();

// Init
$img_large_url  = '';
$img_mobile_url = '';
$img_alt        = '';

/* ------------------------------------------------------------
 * 1. FEATURED IMAGE OR ACF OVERRIDE EXISTS?
 * ------------------------------------------------------------ */
$has_featured  = has_post_thumbnail( $post_id );
$acf_mobile_id = function_exists( 'get_field' ) ? get_field( 'page_settings_media_mobile_image' ) : null;

if ( $has_featured || $acf_mobile_id ) {

	// --- LARGE IMAGE (Featured)
	$img_large_url = get_the_post_thumbnail_url(
		$post_id,
		$settings['resolutionLarge'] ?? 'large'
	);

	// --- MOBILE IMAGE (ACF override takes priority)
	if ( $acf_mobile_id ) {
		$img_mobile_url = wp_get_attachment_image_url(
			$acf_mobile_id,
			$settings['resolutionMobile'] ?? 'medium_large'
		);
	}

	// If no ACF mobile, use featured at mobile resolution
	if ( empty( $img_mobile_url ) ) {
		$img_mobile_url = get_the_post_thumbnail_url(
			$post_id,
			$settings['resolutionMobile'] ?? 'medium_large'
		);
	}

	// Final fallback: use large as mobile
	if ( empty( $img_mobile_url ) ) {
		$img_mobile_url = $img_large_url;
	}

	// ALT
	$thumbnail_id = get_post_thumbnail_id( $post_id );
	$img_alt      = get_post_meta( $thumbnail_id, '_wp_attachment_image_alt', true );
	if ( empty( $img_alt ) ) {
		$img_alt = get_the_title( $post_id );
	}

} /* ------------------------------------------------------------
 * 2. BLOCK FALLBACK SETTINGS (only if no featured image)
 * ------------------------------------------------------------ */
else {

	$large  = $settings['imageLarge'] ?? null;
	$mobile = $settings['imageMobile'] ?? null;

	/* -------------------------
	 * LARGE FALLBACK
	 * ------------------------- */
	if ( ! empty( $large['id'] ) ) {
		$img_large_url = wp_get_attachment_image_url(
			$large['id'],
			$settings['resolutionLarge'] ?? 'large'
		);
	}

	// If WP could not build from ID but "source" exists → use it
	if ( empty( $img_large_url ) && ! empty( $large['source'] ) ) {
		$img_large_url = $large['source'];
	}

	/* -------------------------
	 * MOBILE FALLBACK
	 * ------------------------- */
	if ( ! empty( $mobile['id'] ) ) {
		$img_mobile_url = wp_get_attachment_image_url(
			$mobile['id'],
			$settings['resolutionMobile'] ?? 'medium_large'
		);
	}

	// If mobile has a usable URL (NOT "#"), use it
	if ( empty( $img_mobile_url ) && ! empty( $mobile['source'] ) && $mobile['source'] !== '#' ) {
		$img_mobile_url = $mobile['source'];
	}

	// If mobile still empty → copy large
	if ( empty( $img_mobile_url ) ) {
		$img_mobile_url = $img_large_url;
	}

	// If large empty → copy mobile
	if ( empty( $img_large_url ) ) {
		$img_large_url = $img_mobile_url;
	}

	// If STILL nothing → abort
	if ( empty( $img_large_url ) ) {
		echo '';

		return;
	}

	/* -------------------------
	 * ALT FALLBACK
	 * ------------------------- */
	if ( ! empty( $large['id'] ) ) {
		$img_alt = get_post_meta( $large['id'], '_wp_attachment_image_alt', true );
	}

	if ( empty( $img_alt ) ) {
		$img_alt = get_the_title( $post_id );
	}
}

/* ------------------------------------------------------------
 * 3. Replace placeholders
 * ------------------------------------------------------------ */
$replacements = [
	'%%_FEATURED_IMAGE_LARGE_%%'  => esc_url( $img_large_url ),
	'%%_FEATURED_IMAGE_MOBILE_%%' => esc_url( $img_mobile_url ),
	'%%_FEATURED_ALT_%%'          => esc_attr( $img_alt ),
];

$content = str_replace(
	array_keys( $replacements ),
	array_values( $replacements ),
	$content
);

echo $content;
