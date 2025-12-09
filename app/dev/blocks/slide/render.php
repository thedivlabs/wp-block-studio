<?php
declare( strict_types=1 );

/**
 * Render the Slide block dynamically inside a swiper-slide wrapper.
 */

if ( ! empty( $content ) && empty( $block->context['wpbs/isGallery'] ?? $block->context['wpbs/isLoop'] ?? false ) ) {
	echo $content;

	return;
}

WPBS::console_log( $block ?? false );

$wrapper_attrs = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-slide',
		'swiper-slide',
	] ) ),
] );

echo '<div ' . $wrapper_attrs . '>';

// ------------------------
// Media rendering
// ------------------------
$media = $block->context['wpbs/media'] ?? null;

WPBS::console_log( $media );

if ( is_array( $media ) && ! empty( $media ) ) {

	// Video block
	if ( ( $media['type'] ?? '' ) === 'video' ) {

		$video_block = [
			'blockName'   => 'wpbs/video',
			'attrs'       => [ 'wpbs-video' => $media ],
			'innerBlocks' => [],
		];

		$instance = new WP_Block( $video_block );
		echo $instance->render();

	} // Image block
	elseif ( ! empty( $media['id'] ) ) {

		$size = $media['resolution'] ?? 'large';
		$attr = [];

		$contain = $block->context['wpbs-slide']['props']['contain'] ?? false;
		if ( $contain ) {
			$attr['style'] = 'object-fit: contain;';
		}

		echo wp_get_attachment_image( intval( $media['id'] ), $size, false, $attr );
	}
}

// ------------------------
// Content with placeholders
// ------------------------
$content = $content ?? '';

// Term link replacement
$term_id = $block->context['wpbs/termId'] ?? null;
if ( $term_id ) {
	$term_link = get_term_link( intval( $term_id ) );
	if ( ! is_wp_error( $term_link ) ) {
		$content = str_replace( '%%__TERM_LINK_URL__%%', esc_url( $term_link ), $content );
	}
}

// Post link replacement
$post_id = $block->context['wpbs/postId'] ?? null;
if ( $post_id ) {
	$content = str_replace( '%%__POST_LINK_URL__%%', get_permalink( intval( $post_id ) ), $content );
}

// Echo content safely
echo wp_kses_post( $content );

echo '</div>';
