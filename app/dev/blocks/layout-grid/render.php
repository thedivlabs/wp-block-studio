<?php

global $wp_query;

$attributes = array_filter( $attributes ?? [] );
$block      = $block ?? ( (object) [] );
$content    = $content ?? false;

$is_loop    = in_array( 'is-style-loop', array_values( array_filter( explode( ' ', $attributes['className'] ?? '' ) ) ) );
$is_gallery = in_array( 'is-style-gallery', array_values( array_filter( explode( ' ', $attributes['className'] ?? '' ) ) ) );
$is_current = ( $attributes['wpbs-query']['post_type'] ?? false ) === 'current';

$query = ! $is_loop ? false : match ( true ) {
	$is_current => $wp_query,
	default => WPBS_Grid::query( $attributes )
};

if ( $is_gallery ) {

	$gallery_id = intVal( $attributes['wpbs-media-gallery']['gallery-id'] ?? false );

	$gallery = WPBS_Media_Gallery::query( $gallery_id );

	$image_cards = WPBS_Grid::render( $attributes, $page = 1, $block->parsed_block['innerBlocks'][0] ?? false, $gallery['images'] );

	if ( ! empty( $image_cards['content'] ) ) {
		echo $block->inner_content[0];

		echo $image_cards['content'];

		echo WPBS_Media_Gallery::view_args( $attributes['wpbs-media-gallery'] );

		echo $block->inner_content[ count( $block->inner_content ) - 1 ];
	}


} elseif ( $is_loop && ! empty( $block->parsed_block['innerBlocks'] ) ) {

	if ( ! $query->have_posts() ) {
		return;
	}

	$grid_cards = WPBS_Grid::render( $attributes, $page = 1, $block->parsed_block['innerBlocks'][0] ?? false, $query ?? false );

	if ( $is_current && ! empty( $attributes['wpbs-query']['pagination'] ) && $query->max_num_pages > 1 ) {

		$big = 999999999;

		$current_page = max( 1, get_query_var( 'paged' ) );

		$base = str_replace( $big, '%#%', esc_url( get_pagenum_link( $big ) ) );

		$pagination_links = array_map( function ( $link ) use ( $current_page ) {
			return str_replace( [ '<span', '</span>', 'current' ], [
				'<button type="button" disabled',
				'</button>',
				'current wp-element-button ',
			], $link );
		}, paginate_links( [
			'base'      => $base,
			'format'    => '/page/%#%/',
			'current'   => $current_page,
			'total'     => $query->max_num_pages,
			'prev_next' => false,
			'mid_size'  => 6,
			//'prev_text' => '←',
			//'next_text' => '→',
			'type'      => 'array', // 'plain', 'array', or 'list'
		] ) );

		do_blocks( '<!-- wp:query-pagination --><!-- wp:query-pagination-previous /--><!-- wp:query-pagination-numbers {"className":"inline-flex w-max"}  /--><!-- wp:query-pagination-next /--><!-- /wp:query-pagination -->' );

		if ( $pagination_links ) {
			$pagination = '<nav class="wp-block-query-pagination mt-8" aria-label="Pagination">';

			$pagination .= '<div class="wp-block-query-pagination-numbers inline-flex w-max">';

			foreach ( $pagination_links as $link ) {
				$pagination .= $link;
			}

			$pagination .= '</div>';

			$pagination .= '</nav>';

			$block->inner_content[ count( $block->inner_content ) - 1 ] = $pagination . $block->inner_content[ count( $block->inner_content ) - 1 ];
		}
	}

	$block->inner_content[1] = trim( $grid_cards['content'] ?? '' );

	$block->inner_content[ count( $block->inner_content ) - 1 ] = str_replace( '<script class="wpbs-layout-grid-args" type="application/json">', '<script class="wpbs-layout-grid-args" type="application/json">' . wp_json_encode( array_filter( [
			'card'  => WPBS::get_block_template( $block->inner_blocks[0]->parsed_block ?? [] ),
			'query' => $query->query,
			'cur'   => $query->is_paged ?: 1,
			'max'   => $query->max_num_pages ?? 1,
			'attrs' => $attributes['wpbs-query'],
		] ) ), $block->inner_content[ count( $block->inner_content ) - 1 ] );

	foreach ( $block->inner_content as $html ) {
		echo $html;
	}


} elseif ( ! empty( $block->parsed_block['innerBlocks'] ) ) {

	echo $block->inner_content[0];

	foreach ( $block->parsed_block['innerBlocks'] ?? [] as $parsed_block ) {

		echo render_block( $parsed_block );
	}

	echo $block->inner_content[ count( $block->inner_content ) - 1 ];
} else {
	echo $content;
}


WPBS_Blocks::render_block_styles( $attributes ?? false );



