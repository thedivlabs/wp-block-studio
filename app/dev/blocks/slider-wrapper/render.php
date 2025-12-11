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

WPBS::console_log( $template_block );

/**
 * 2. If NOT gallery and NOT loop → return raw content
 */
if ( ! $is_loop && ! $is_gallery ) {
	echo $content;

	return;
}


// Generate loop HTML + data
$loop_data = WPBS_Loop::build(
	$template_block,
	$query_settings,
	max( 1, get_query_var( 'paged', 1 ) )
);


WPBS::console_log( $loop_data );

return;

/**
 * 4. Extract the loop HTML
 */
$dynamic_html = $loop_data['html'] ?? '';

/**
 * 5. Replace the marker inside the saved content
 */
$marker = '%%__BLOCK_CONTENT__%%';

// If marker missing, fail gracefully (prevents blank blocks in edge cases)
if ( strpos( $content, $marker ) === false ) {
	echo $content;

	return;
}

$final_output = str_replace( $marker, $dynamic_html, $content );

/**
 * 6. Echo the rendered content with dynamic loop inserted
 */
echo $final_output;

/**
 * 7. Loop pagination + script output
 */
$loop_instance->output_loop_script(
	$inner_block,
	$loop_data,
	$merged_query,
	max( 1, get_query_var( 'paged', 1 ) )
);
