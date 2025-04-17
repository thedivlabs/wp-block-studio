<?php

global $wp_query;


$attributes = array_filter( $attributes ?? [] );
$block      = $block ?? ( (object) [] );
$content    = $content ?? false;

$is_loop    = in_array( 'is-style-loop', array_values( array_filter( explode( ' ', $attributes['className'] ?? '' ) ) ) );
$is_current = ( $attributes['wpbs-loop-type'] ?? false ) === 'current';

$query = ! $is_loop ? false : match ( true ) {
	$is_current => $wp_query,
	default => WPBS_Grid::query( $attributes )
};

if ( $is_loop ) {

	$block->attributes['queryId'] = 'main';

	$block_template = $block->parsed_block['innerBlocks'][0] ?? false;

	$new_content = '';

	if ( $query->have_posts() ) {

		while ( $query->have_posts() ) {

			$query->the_post();

			$new_block = new WP_Block( $block_template, array_filter( [
				'postId' => get_the_ID(),
			] ) );

			$unique_id = join( ' ', array_filter( [
				$new_block->attributes['uniqueId'] ?? null,
				'wpbs-layout-grid-card-' . $query->current_post
			] ) );

			$new_block->inner_content[0]       = str_replace( $new_block->attributes['uniqueId'] ?? false, $unique_id, $new_block->inner_content[0] );
			$new_block->inner_html             = str_replace( $new_block->attributes['uniqueId'] ?? false, $unique_id, $new_block->inner_html );
			$new_block->attributes['uniqueId'] = $unique_id;

			$new_content .= $new_block->render();

		}

		$query->reset_postdata();
	}

	$new_content .= '<script class="wpbs-layout-grid-args" type="application/json">' . wp_json_encode( [
			'card'  => WPBS::get_block_template( $block->inner_blocks[0]->parsed_block ?? [] ),
			'query' => $is_current ? $query->query : false,
			'attrs' => array_filter( $attributes, function ( $attribute ) {
				return str_starts_with( $attribute, 'wpbs-loop' ) || $attribute == 'queryArgs';
			}, ARRAY_FILTER_USE_KEY ),
		] ) . '</script>';

	if ( ! empty( $attributes['wpbs-pagination'] ) && $query->max_num_pages > 1 ) {
		if ( $is_current ) {
			$big = 999999999;

			$current_page = max( 1, get_query_var( 'paged' ) );

			$base = str_replace( $big, '%#%', esc_url( get_pagenum_link( $big ) ) );

			$pagination_links = array_map( function ( $link ) use ( $current_page ) {
				return str_replace( [ '<span', '</span>', 'current' ], [
					'<button type="button" disabled',
					'</button>',
					'current wp-element-button '
				], $link );
			}, paginate_links( [
				'base'      => $base,
				'format'    => '/page/%#%/',
				'current'   => $current_page,
				'total'     => $query->max_num_pages,
				'prev_next' => false,
				//'prev_text' => '←',
				//'next_text' => '→',
				'type'      => 'array', // 'plain', 'array', or 'list'
			] ) );

			do_blocks( '<!-- wp:query-pagination --><!-- wp:query-pagination-previous /--><!-- wp:query-pagination-numbers /--><!-- wp:query-pagination-next /--><!-- /wp:query-pagination -->' );

			if ( $pagination_links ) {
				$pagination = '<nav class="wp-block-query-pagination" aria-label="Pagination">';

				if ( $current_page > 1 ) {
					$pagination .= '<a href="' . esc_url( get_pagenum_link( $current_page - 1 ) ) . '" class="wp-block-query-pagination-previous" aria-label="Previous Page"><span class="wp-block-query-pagination-previous-arrow is-arrow-arrow" aria-hidden="true">←</span></a>';
				}

				$pagination .= '<div class="wp-block-query-pagination-numbers">';

				foreach ( $pagination_links as $link ) {
					$pagination .= $link;
				}

				$pagination .= '</div>';

				if ( $current_page < $query->max_num_pages ) {
					$pagination .= '<a href="' . esc_url( get_pagenum_link( $current_page + 1 ) ) . '" class="wp-block-query-pagination-next" aria-label="Next Page"><span class="wp-block-query-pagination-next-arrow is-arrow-arrow" aria-hidden="true">→</span></a>';
				}

				$pagination .= '</nav>';
			}

			$new_content .= $pagination ?? '';
		} else {
			$new_content .= '<button type="button" class="w-full h-10 relative" data-wp-on-async--click="actions.pagination">' . ( $attributes['wpbs-pagination-label'] ?? 'Show More' ) . '</button>';
		}
	}

	$block->inner_content[1] = trim( $new_content );




}

if ( ! empty( $attributes['wpbs-masonry'] ) ) {

	$last_index = count($block->inner_content) - 1;

	$block->inner_content[$last_index] = '<span class="gutter-sizer" style="width:var(--row-gap, var(--column-gap, 0px))"></span>"' . $block->inner_content[$last_index];
}

echo join( ' ', $block->inner_content );

WPBS_Grid::render_style( $attributes, $block, $query ?? $wp_query );

?>


