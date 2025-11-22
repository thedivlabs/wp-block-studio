<?php
/**
 * Render.php
 * Replaces placeholders from block.js with actual Featured Image data
 * and falls back to block-level imageLarge / imageMobile if needed.
 */

$settings = $attributes['wpbs-figure'] ?? [];

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
	$img_large_url = $has_featured
		? get_the_post_thumbnail_url(
			$post_id,
			$settings['resolutionLarge'] ?? 'large'
		)
		: '';

	// --- MOBILE IMAGE (ACF override takes priority)
	if ( $acf_mobile_id ) {
		$img_mobile_url = wp_get_attachment_image_url(
			$acf_mobile_id,
			$settings['resolutionMobile'] ?? 'medium_large'
		);
	}

	// If no ACF mobile, grab featured version (when it exists)
	if ( empty( $img_mobile_url ) && $has_featured ) {
		$img_mobile_url = get_the_post_thumbnail_url(
			$post_id,
			$settings['resolutionMobile'] ?? 'medium_large'
		);
	}

	// Final fallback: use large as mobile
	if ( empty( $img_mobile_url ) ) {
		$img_mobile_url = $img_large_url;
	}

	// ALT from featured image if we have one
	if ( $has_featured ) {
		$thumbnail_id = get_post_thumbnail_id( $post_id );
		$img_alt      = get_post_meta( $thumbnail_id, '_wp_attachment_image_alt', true );
	}

	if ( empty( $img_alt ) ) {
		$img_alt = get_the_title( $post_id );
	}

	/**
	 * IMPORTANT: if there is NO featured image but there IS an ACF mobile image,
	 * we still want a proper LARGE fallback from the block settings.
	 */
	if ( empty( $img_large_url ) ) {

		$large  = $settings['imageLarge'] ?? null;
		$mobile = $settings['imageMobile'] ?? null;

		// Try block large ID
		if ( ! empty( $large['id'] ) ) {
			$img_large_url = wp_get_attachment_image_url(
				$large['id'],
				$settings['resolutionLarge'] ?? 'large'
			);
		}

		// If that fails, try block large source
		if ( empty( $img_large_url ) && ! empty( $large['source'] ) && $large['source'] !== '#' ) {
			$img_large_url = $large['source'];
		}

		// As a last resort, allow block mobile to drive large
		if ( empty( $img_large_url ) && ! empty( $mobile['id'] ) ) {
			$img_large_url = wp_get_attachment_image_url(
				$mobile['id'],
				$settings['resolutionLarge'] ?? 'large'
			);
		}

		if ( empty( $img_large_url ) && ! empty( $mobile['source'] ) && $mobile['source'] !== '#' ) {
			$img_large_url = $mobile['source'];
		}

		// If STILL empty, at least mirror mobile
		if ( empty( $img_large_url ) ) {
			$img_large_url = $img_mobile_url;
		}
	}

} /* ------------------------------------------------------------
 * 2. BLOCK FALLBACK SETTINGS (only if no featured + no ACF mobile)
 * ------------------------------------------------------------ */
else {

	$large  = $settings['imageLarge'] ?? null;
	$mobile = $settings['imageMobile'] ?? null;

	// --- LARGE FALLBACK ---
	if ( ! empty( $large['id'] ) ) {
		$img_large_url = wp_get_attachment_image_url(
			$large['id'],
			$settings['resolutionLarge'] ?? 'large'
		);
	}

	// If WP fails to fetch from ID, use saved source
	if ( empty( $img_large_url ) && ! empty( $large['source'] ) && $large['source'] !== '#' ) {
		$img_large_url = $large['source'];
	}

	// --- MOBILE FALLBACK ---
	if ( ! empty( $mobile['id'] ) ) {
		$img_mobile_url = wp_get_attachment_image_url(
			$mobile['id'],
			$settings['resolutionMobile'] ?? 'medium_large'
		);
	}

	// If WP fails or mobile had no ID, use its source (if any)
	if ( empty( $img_mobile_url ) && ! empty( $mobile['source'] ) && $mobile['source'] !== '#' ) {
		$img_mobile_url = $mobile['source'];
	}

	// If mobile missing, use large
	if ( empty( $img_mobile_url ) ) {
		$img_mobile_url = $img_large_url;
	}

	// If large missing, use mobile
	if ( empty( $img_large_url ) ) {
		$img_large_url = $img_mobile_url;
	}

	// If still nothing → abort
	if ( empty( $img_large_url ) ) {
		echo '';

		return;
	}

	// ALT fallback
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
