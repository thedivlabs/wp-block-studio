<?php
declare( strict_types=1 );

WPBS::console_log( $block ?? false );

$is_loop        = ! empty( $block->context['wpbs/isLoop'] );
$query_settings = $block->context['wpbs/query'] ?? [];
$is_current     = ( $query_settings['post_type'] ?? false ) === 'current' && $is_loop;


if(!$is_loop){
	echo $content ?? null;
	return;
}

/**
 * Merge block query attributes with defaults
 */
$default_query = [
	'post_type'      => 'post',
	'taxonomy'       => '',
	'term'           => '',
	'posts_per_page' => 12,
	'orderby'        => 'date',
	'order'          => 'DESC',
];

$merged_query = array_merge( $default_query, $query_settings );

/**
 * Initialize loop instance and render cards
 */
$loop_instance = WPBS_Loop::init();

$loop_data = $loop_instance->render_from_php(
	$block->parsed_block['innerBlocks'][0] ?? [],                       // full block AST
	$merged_query,                 // merged query
	max( 1, get_query_var( 'paged', 1 ) ) // current page
);

WPBS::console_log($loop_data);

/**
 * Output the grid wrapper and loop cards
 */
echo str_replace('%%__BLOCK_CONTENT_AREA__%%', $loop_data['html'] ?? '', $content ?? '');
