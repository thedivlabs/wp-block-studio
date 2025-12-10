<?php
declare( strict_types=1 );

/**
 * GRID CONTAINER — UPDATED TO MATCH SLIDER WRAPPER LOGIC
 *
 * Loop + Gallery determine their own query settings.
 * Grid no longer stores or normalizes "query" inside wpbs-grid.
 */
WPBS::console_log( $block ?? false );
// Extract context
$is_loop        = ! empty( $block->context['wpbs/isLoop'] );
$is_gallery     = ! empty( $block->context['wpbs/isGallery'] );
$query_settings = $block->context['wpbs/query'] ?? [];

// If not loop and not gallery → output HTML as-is.
if ( ! $is_loop && ! $is_gallery ) {
	echo $content ?? null;

	return;
}

/**
 * Merge query settings (Loop or Gallery component provides them)
 */
$default_query = [];
$merged_query  = array_merge( $default_query, $query_settings );

/**
 * Initialize WPBS Loop Engine
 */
$loop_instance = WPBS_Loop::init();

$loop_data = $loop_instance->render_from_php(
	$block->parsed_block['innerBlocks'][0] ?? [],
	$merged_query,
	max( 1, get_query_var( 'paged', 1 ) )
);

// Build wrapper class list
$wrapper_classes = [
	'wpbs-layout-grid-container',
	$attributes['uniqueId'] ?? '',
	"grid-container",
	"w-full",
	"flex",
	"flex-wrap",
	"relative",
	"z-20",
	"block"
];

/**
 * Build wrapper attributes
 */
$wrapper_attrs = get_block_wrapper_attributes( array_filter( [
	'class'         => trim( implode( ' ', $wrapper_classes ) ),
	'data-lightbox' => $is_gallery ? json_encode( $loop_data['lightbox'] ?? [] ) : null,
] ) );

// Output wrapper
echo '<div ' . $wrapper_attrs . '>';

// Cards HTML
echo $loop_data['html'] ?? '';

// Close wrapper
echo '</div>';

// Output loop scripts
$loop_instance->output_loop_script(
	$block->parsed_block['innerBlocks'][0] ?? [],
	$loop_data,
	$merged_query,
	max( 1, get_query_var( 'paged', 1 ) )
);
