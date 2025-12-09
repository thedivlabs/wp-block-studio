<?php
declare( strict_types=1 );

// Original loop/context logic from layout-grid-container
$slider_settings = $block->context['wpbs/slider'] ?? [];
$query_settings  = $block->context['wpbs/query'] ?? [];
$is_loop         = ! empty( $block->context['wpbs/isLoop'] );
$is_gallery      = ! empty( $block->context['wpbs/isGallery'] );
$is_current      = ( $query_settings['post_type'] ?? false ) === 'current' && $is_loop;


WPBS::console_log( $query_settings );

// If not a loop, output the normal content and exit
if ( ! $is_loop && ! $is_gallery ) {
	echo $content ?? null;

	return;
}

// Merge block query settings with defaults
$default_query = [
	'post_type' => 'post',
	'taxonomy'  => '',
	'term'      => '',
	'orderby'   => 'date',
	'order'     => 'DESC',
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

// Build wrapper attributes using the core block wrapper helper.
$wrapper_attrs = get_block_wrapper_attributes( [
	'class' => trim( implode( ' ', array_filter( [
		'swiper-wrapper',
	] ) ) ),
] );

// Open wrapper
echo '<div ' . $wrapper_attrs . '>';

// Output looped HTML from the WPBS loop engine
echo $loop_data['html'] ?? '';

// Close wrapper
echo '</div>';

// Output scripts exactly as the original behavior
$loop_instance->output_loop_script(
	$block->parsed_block['innerBlocks'][0] ?? [],
	$loop_data,
	$merged_query,
	max( 1, get_query_var( 'paged', 1 ) )
);

