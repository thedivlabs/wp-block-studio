<?php
declare( strict_types=1 );

// Original loop/context logic from layout-grid-container
$is_loop        = ! empty( $block->context['wpbs/isLoop'] );
$query_settings = $block->context['wpbs/query'] ?? [];
$is_current     = ( $query_settings['post_type'] ?? false ) === 'current' && $is_loop;

// If not a loop, output the normal content and exit
if ( ! $is_loop ) {
	echo $content ?? null;

	return;
}

// Merge block query settings with defaults
$default_query = [
	'post_type'      => 'post',
	'taxonomy'       => '',
	'term'           => '',
	'posts_per_page' => 12,
	'orderby'        => 'date',
	'order'          => 'DESC',
];
$merged_query  = array_merge( $default_query, $query_settings );

// Initialize the loop
$loop_instance = WPBS_Loop::init();

// Render the first inner block AST
$loop_data = $loop_instance->render_from_php(
	$block->parsed_block['innerBlocks'][0] ?? [],
	$merged_query,
	max( 1, get_query_var( 'paged', 1 ) )
);

// Instead of extracting the original grid wrapper tags, use swiper-wrapper
echo '<div class="swiper-wrapper ' . esc_attr( $block->className ?? '' ) . '">';

// Output the looped content (child blocks)
echo $loop_data['html'] ?? '';

echo '</div>';

// Output the loop scripts exactly as the original code
$loop_instance->output_loop_script(
	$block->parsed_block['innerBlocks'][0] ?? [],
	$loop_data,
	$merged_query,
	max( 1, get_query_var( 'paged', 1 ) )
);
