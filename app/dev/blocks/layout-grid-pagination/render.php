<?php

$is_loop        = ! empty( $block->context['wpbs/isLoop'] );
$grid_settings  = $block->context['wpbs/grid']['props'] ?? [];
$query_settings = $block->context['wpbs/query'] ?? [];
$is_current     = ( $query_settings['post_type'] ?? false ) === 'current' && $is_loop;
$settings       = $block->attributes['wpbs-layout-grid-pagination'] ?? [];
$is_button      = str_contains( $block->attributes['className'] ?? '', 'is-style-button' );

$button_label = $settings['buttonLabel'] ?? 'Show More';
$icon_next    = $settings['iconNext'] ?? false;
$icon_prev    = $settings['iconPrev'] ?? false;
$output       = '';

$block_class = implode( ' ', array_filter( [
	'wpbs-layout-grid-pagination',
	$is_button ? 'wp-element-button button loop-button' : null,
] ) );

$block_attributes = get_block_wrapper_attributes( [
	'class' => $block_class
] );

$tag_name = $is_button ? 'button' : 'div';

if ( $is_current && ! $is_button ) {
	global $wp_query;
	$paged = max( 1, get_query_var( 'paged', 1 ) );

	if ( ! $wp_query->have_posts() ) {
		return '';
	}

	$output = '';

// If not the main loop, just show "Load More" button
	if ( ! $is_current && $wp_query->max_num_pages > $paged ) {
		$button_block = new WP_Block( [
			'blockName' => 'wpbs/loop-pagination-button'
		], [
			'label' => $button_label
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
		'total'     => $wp_query->max_num_pages,
		'prev_next' => true,
		'mid_size'  => 4,
		'end_size'  => 1,
		'type'      => 'array',
		'prev_text' => $icon_prev,
		'next_text' => $icon_next,
	] );

	if ( ! empty( $pagination_links ) ) {
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
	}
}

if ( $is_button ) {
	$output = $button_label;
}


wp_reset_postdata();

echo "<{$tag_name} {$block_attributes}>";
echo $output;
echo "</{$tag_name}>";
