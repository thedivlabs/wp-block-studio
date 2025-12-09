<?php


$settings   = $block->context['wpbs/query'] ?? [];
$media_item = $block->context['wpbs/media'] ?? null;

$wrapper_attrs = get_block_wrapper_attributes( [
	'class' => 'wpbs-slide swiper-slide',
] );

echo '<div ' . $wrapper_attrs . '>';

// -----------------------------------------
// Build media renderer
// -----------------------------------------

$media = new WPBS_Media( $media_item, $settings );

// Render (image or video automatically)
echo $media->render();


// -----------------------------------------
// CONTENT REPLACEMENTS
// -----------------------------------------

$content = $content ?? '';

$term_id = $block->context['wpbs/termId'] ?? null;
if ( $term_id ) {
	$term_link = get_term_link( (int) $term_id );
	if ( ! is_wp_error( $term_link ) ) {
		$content = str_replace( '%%__TERM_LINK_URL__%%', esc_url( $term_link ), $content );
	}
}

$post_id = $block->context['wpbs/postId'] ?? null;
if ( $post_id ) {
	$content = str_replace( '%%__POST_LINK_URL__%%', get_permalink( (int) $post_id ), $content );
}

echo wp_kses_post( $content );

echo '</div>';
