<?php
declare( strict_types=1 );

WPBS::console_log( $block ?? false );

$is_loop        = ! empty( $block->attributes['isLoop'] );
$grid_settings  = $block->attributes['wpbs-grid']['props'] ?? [];
$query_settings = $block->attributes['query'] ?? [];
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

$merged_query = array_merge( $default_query, $block['attrs']['query'] ?? [] );

/**
 * Initialize loop instance and render cards
 */
$loop_instance = WPBS_Loop::init();

$loop_data = $loop_instance->render_from_php(
	$block,                       // full block AST
	$merged_query,                 // merged query
	max( 1, get_query_var( 'paged', 1 ) ) // current page
);

/**
 * Build block wrapper attributes
 */
$block_class = implode( ' ', array_filter( [
	'wpbs-layout-grid',
	'wpbs-layout-grid-0',
	$block['attrs']['className'] ?? '',
] ) );

$block_attributes = get_block_wrapper_attributes( [
	'class'               => $block_class,
	'data-wp-interactive' => $is_loop && !$is_current ? 'wpbs/layout-grid' : null,
] );

WPBS::console_log($loop_data);

/**
 * Output the grid wrapper and loop cards
 */
echo "<div {$block_attributes}>";
echo $loop_data['html'] ?? '';
echo '</div>';
