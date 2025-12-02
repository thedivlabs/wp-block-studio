<?php

$is_loop        = ! empty( $block->context['wpbs/isLoop'] );
$grid_settings  = $block->context['wpbs/grid']['props'] ?? [];
$query_settings = $block->context['wpbs/query'] ?? [];
$settings       = $block->attributes['wpbs-layout-grid-pagination'] ?? [];

WPBS::console_log( $block->context ?? false );
WPBS::console_log( $is_loop );
WPBS::console_log( $grid_settings );

$pagination_label = $grid_settings['buttonLabel'] ?? 'Show More';
$icon_next        = $settings['iconNext'] ?? false;
$icon_prev        = $settings['iconPrev'] ?? false;
$is_current       = ( $query_settings['post_type'] ?? false ) === 'current' && ! empty( $block->context['wpbs/isLoop'] );


if ( empty( $conext['isLoop'] ) ) {
	return;
}


if ( ! $is_current ) {
	echo $content ?? '';

	return;
}

$paged = max( 1, get_query_var( 'paged', 1 ) );

$query_args = array_filter( [
	'post_type'      => $query_settings['post_type'] ?? 'post',
	'posts_per_page' => $query_settings['posts_per_page'] ?? get_option( 'posts_per_page' ),
	'orderby'        => $query_settings['orderby'] ?? 'date',
	'order'          => $query_settings['order'] ?? 'DESC',
	'paged'          => $paged,
	'post__in'       => $query_settings['post__in'] ?? [],
	'post__not_in'   => $query_settings['post__not_in'] ?? [],
] );

if ( ! empty( $query_settings['taxonomy'] ) && ! empty( $query_settings['term'] ) ) {
	$query_args['tax_query'] = [
		[
			'taxonomy' => $query_settings['taxonomy'],
			'field'    => 'term_id',
			'terms'    => $query_settings['term'],
		]
	];
}

$query = new WP_Query( $query_args );

if ( ! $query->have_posts() ) {
	return '';
}

$output = '';

// If not the main loop, just show "Load More" button
if ( ! $is_current && $query->max_num_pages > $paged ) {
	$button_block = new WP_Block( [
		'blockName' => 'wpbs/loop-pagination-button'
	], [
		'label' => $pagination_label
	] );

	$output .= $button_block->render();

	echo $output;
}

// Standard paginate_links
$big  = 999999999;
$base = str_replace( $big, '%#%', esc_url( get_pagenum_link( $big ) ) );

$pagination_links = paginate_links( [
	'base'      => $base,
	'format'    => '/page/%#%/',
	'current'   => $paged,
	'total'     => $query->max_num_pages,
	'prev_next' => true,
	'mid_size'  => 4,
	'end_size'  => 1,
	'type'      => 'array',
	'prev_text' => $icon_prev,
	'next_text' => $icon_next,
] );

if ( empty( $pagination_links ) ) {
	return '';
}

// Replace classes to match WP core query pagination block
$pagination_links = array_map( function ( $link ) {
	return str_replace(
		[ '<span', '</span>', 'current', 'next page-numbers', 'prev page-numbers' ],
		[
			'<button type="button" disabled',
			'</button>',
			'current wp-element-button',
			'next wp-block-query-pagination-next material-symbols-outlined',
			'prev wp-block-query-pagination-previous material-symbols-outlined',
		],
		$link
	);
}, $pagination_links );

$output .= '<nav class="wp-block-query-pagination relative z-20" aria-label="Pagination">';
$output .= '<div class="wp-block-query-pagination-numbers inline-flex w-max items-center">';
$output .= implode( '', $pagination_links );
$output .= '</div>';
$output .= '</nav>';

wp_reset_postdata();

echo $output;