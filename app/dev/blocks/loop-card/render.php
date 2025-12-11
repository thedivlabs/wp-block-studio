<?php
declare( strict_types=1 );

// Safety
$content = $content ?? '';

/**
 * 1. Read context
 */
$is_loop        = ! empty( $block->context['wpbs/isLoop'] );
$is_gallery     = ! empty( $block->context['wpbs/isGallery'] );
$query_settings = $block->context['wpbs/query'] ?? [];
$template_block = $block->parsed_block['innerBlocks'][0] ?? [];

/**
 * 2. If NOT gallery and NOT loop → output raw content
 */
if ( ! $is_loop && ! $is_gallery ) {
	echo $content;

	return;
}

/**
 * 3. Build loop HTML
 */
$loop_data = WPBS_Loop::build(
	$template_block,
	$query_settings,
	max( 1, get_query_var( 'paged', 1 ) )
);

$dynamic_html = $loop_data['html'] ?? '';

/**
 * 4. Wrapper attributes
 */
$attrs = get_block_wrapper_attributes( array_filter( [
	'class'         => 'wpbs-loop-card w-full block relative',
	'data-lightbox' => $is_gallery ? json_encode( $loop_data['lightbox'] ?? [] ) : null,
] ) );

/**
 * 5. Output wrapper
 */
echo "<div {$attrs}>{$dynamic_html}</div>";
