<?php
declare( strict_types=1 );

// Safety
$content = $content ?? '';

/**
 * 1. Read block mode from context
 */
$slider_settings = $block->context['wpbs/slider'] ?? [];
$query_settings  = $block->context['wpbs/query'] ?? [];

$is_loop        = ! empty( $block->context['wpbs/isLoop'] );
$is_gallery     = ! empty( $block->context['wpbs/isGallery'] );
$template_block = $block->parsed_block['innerBlocks'][0] ?? [];

/**
 * 2. If NOT gallery and NOT loop → return raw content
 */
if ( ! $is_loop && ! $is_gallery ) {
	echo $content;

	return;
}

/**
 * 3. Build loop content
 */
$loop_data = WPBS_Loop::build(
	$template_block,
	$query_settings,
	max( 1, get_query_var( 'paged', 1 ) )
);

$dynamic_html = $loop_data['html'] ?? '';
$dynamic_json = $loop_data['script'] ?? '';

/**
 * 4. Render wrapper div with block wrapper attributes.
 *
 * We do NOT use $block->inner_html anymore.
 * We directly print our own wrapper and inject dynamic content inside.
 */

$attrs = get_block_wrapper_attributes( array_filter( [
	'class'         => 'wpbs-slider-wrapper swiper-wrapper',
	'data-lightbox' => $is_gallery ? json_encode( $loop_data['lightbox'] ) : null,
] ) );

echo "<div {$attrs}>{$dynamic_html}</div>";
