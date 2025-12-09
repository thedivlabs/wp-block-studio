<?php
declare( strict_types=1 );

/**
 * Render the Slide block dynamically inside a swiper-slide wrapper.
 */

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

if ( $media ) {

	// Video block
	if ( ! empty( $media['type'] ) && $media['type'] === 'video' ) {

		$video_block = [
			'blockName'   => 'wpbs/video',
			'attrs'       => [ 'wpbs-video' => $media ],
			'innerBlocks' => [],
		];

		$instance = new WP_Block( $video_block );
		echo $instance->render();

	} // Image
	elseif ( ! empty( $media['id'] ) ) {

		$size = $media['resolution'] ?? 'large';
		$attr = [];

		if ( ! empty( $block->context['wpbs-slide']['props']['contain'] ) ) {
			$attr['style'] = 'object-fit: contain;';
		}

		echo wp_get_attachment_image( intval( $media['id'] ), $size, false, $attr );
	}
}

// ------------------------
// Replace placeholders for links
// ------------------------
$content = $content ?? '';

if ( ! empty( $block->context['wpbs/termId'] ) ) {
	$term_link = get_term_link( $block->context['wpbs/termId'] );
	$content   = str_replace( '%%__TERM_LINK_URL__%%', esc_url( $term_link ), $content );
}

if ( ! empty( $block->context['wpbs/postId'] ) ) {
	$content = str_replace( '%%__POST_LINK_URL__%%', get_permalink( intval( $block->context['wpbs/postId'] ) ), $content );
}

echo $content;

echo '</div>';
