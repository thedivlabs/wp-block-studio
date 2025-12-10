<?php
declare( strict_types=1 );

// Safety
$content = $content ?? '';

/**
 * 1. Read block mode from context
 */
$slider_settings = $block->context['wpbs/slider'] ?? [];
$query_settings  = $block->context['wpbs/query'] ?? [];

$is_loop    = ! empty( $block->context['wpbs/isLoop'] );
$is_gallery = ! empty( $block->context['wpbs/isGallery'] );

/**
 * 2. If NOT gallery and NOT loop → return raw content
 */
if ( ! $is_loop && ! $is_gallery ) {
	echo $content;

	return;
}

/**
 * 3. Build query + loop engine
 */
$default_query = [];
$merged_query  = array_merge( $default_query, $query_settings );

$loop_instance = WPBS_Loop::init();

$inner_block = $block->parsed_block['innerBlocks'][0] ?? [];

// Generate loop HTML + data
$loop_data = $loop_instance->render_from_php(
	$inner_block,
	$merged_query,
	max( 1, get_query_var( 'paged', 1 ) )
);

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
