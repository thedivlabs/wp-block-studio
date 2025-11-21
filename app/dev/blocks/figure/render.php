<?php
/**
 * Render.php — Correct Featured-Image Fallback Logic
 *
 * Replaces block.js placeholders with:
 * 1. Featured image URLs (if the post has a thumbnail)
 * 2. Otherwise: the block’s fallback imageLarge / imageMobile
 */

if ( empty( $content ) ) {
	return;
}

$settings = $attributes['wpbs-figure'] ?? [];
$type     = $settings['type'] ?? 'image';
$post_id  = get_the_ID();

/**
 * Only Featured Image mode uses PHP replacement.
 */
if ( $type !== 'featured-image' ) {
	echo $content;

	return;
}

/* ------------------------------------------------------------
 * 1. Helper: Get ALT from attachment ID
 * ------------------------------------------------------------ */
$get_alt = static function ( $attachment_id ): string {
	if ( ! $attachment_id ) {
		return '';
	}

	// Primary source: dedicated alt field
	$alt = get_post_meta( $attachment_id, '_wp_attachment_image_alt', true );

	// Fallback: attachment title
	if ( ! $alt ) {
		$alt = get_the_title( $attachment_id );
	}

	return $alt ?: '';
};

/* ------------------------------------------------------------
 * 2. Try the post’s Featured Image first
 * ------------------------------------------------------------ */
$img_large_url  = null;
$img_mobile_url = null;
$img_alt        = '';

$has_featured = $post_id && has_post_thumbnail( $post_id );

if ( $has_featured ) {

	$featured_id    = get_post_thumbnail_id( $post_id );
	$img_large_url  = wp_get_attachment_image_url( $featured_id, 'full' );
	$img_mobile_url = wp_get_attachment_image_url( $featured_id, 'medium_large' );
	$img_alt        = $get_alt( $featured_id );

} else {

	/* ------------------------------------------------------------
	 * 3. FALLBACK: block-defined Large/Mobile images
	 * ------------------------------------------------------------ */
	$large  = $settings['imageLarge'] ?? null;
	$mobile = $settings['imageMobile'] ?? null;

	// Try to get fallback alt text from either image
	if ( ! empty( $large['id'] ) ) {
		$img_alt = $get_alt( $large['id'] );
	} elseif ( ! empty( $mobile['id'] ) ) {
		$img_alt = $get_alt( $mobile['id'] );
	}

	// Build URLs for fallback images
	if ( ! empty( $large['id'] ) ) {
		$img_large_url = wp_get_attachment_image_url( $large['id'], 'full' );
	}

	if ( ! empty( $mobile['id'] ) ) {
		$img_mobile_url = wp_get_attachment_image_url( $mobile['id'], 'medium_large' );
	}

	// If neither image exists → bail out
	if ( ! $img_large_url && ! $img_mobile_url ) {
		echo '';

		return;
	}

	// Match ResponsivePicture’s own fallback rules:
	if ( ! $img_mobile_url ) {
		$img_mobile_url = $img_large_url;
	}
	if ( ! $img_large_url ) {
		$img_large_url = $img_mobile_url;
	}
}

/* ------------------------------------------------------------
 * 4. Replace placeholders (block.js emits these)
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

/* ------------------------------------------------------------
 * 5. Output final markup
 * ------------------------------------------------------------ */
echo $content;
