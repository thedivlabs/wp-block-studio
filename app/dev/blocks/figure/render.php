<?php
/**
 * Render.php
 * * Replaces placeholders from block.js with actual Featured Image data.
 */

if ( empty( $content ) ) {
	return;
}

WPBS::console_log( $block->attributes ?? false );

// 1. Get the current Post ID (or allow context to pass it)
$post_id = get_the_ID();

// 2. Initialize variables
$feat_img_url = '';
$feat_img_alt = '';

// 3. Fetch Featured Image Data if it exists
if ( has_post_thumbnail( $post_id ) ) {
	$feat_img_url = get_the_post_thumbnail_url( $post_id, 'full' ); // You can change 'full' to 'large' etc.

	// Get the Alt text
	$thumbnail_id = get_post_thumbnail_id( $post_id );
	$feat_img_alt = get_post_meta( $thumbnail_id, '_wp_attachment_image_alt', true );
}

// 4. Perform String Replacement on the block content
// The JS outputs: src="#FEATURED_LARGE#" and alt="#FEATURED_ALT#"
$content = str_replace( '%%_FEATURED_IMAGE_%%', esc_url( $feat_img_url ), $content );
$content = str_replace( '%%_FEATURED_ALT_%%', esc_attr( $feat_img_alt ), $content );

// 5. Output the final HTML
echo $content;