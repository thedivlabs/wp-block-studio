<?php

global $wp_query;


$attributes = array_filter( $attributes ?? [] );
$block      = $block ?? ( (object) [] );
$content    = $content ?? false;

$is_loop = in_array( 'is-style-loop', array_values( array_filter( explode( ' ', $attributes['className'] ?? '' ) ) ) );

WPBS_Grid::render_style( $attributes, $block );

if ( $is_loop ) {

	$block_template = $block->parsed_block['innerBlocks'][0] ?? false;

	$query = WPBS_Grid::query( $attributes );

	$new_content = '';

	if ( $query->have_posts() ) {

		while ( $query->have_posts() ) {

			$query->the_post();

			setup_postdata( $query->post );

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

		wp_reset_postdata();
	}

	$pagination = paginate_links( array(
		'base'    => str_replace( 99999, '%#%', esc_url( get_pagenum_link( 99999 ) ) ),
		'format'  => '?paged=%#%',
		'current' => max( 1, get_query_var( 'paged' ) ),
		'total'   => $query->max_num_pages
	) );

	$new_content .= ! empty( $pagination ) ? trim( join( ' ', [
		'<nav class="wpbs-layout-grid-pagination">',
		$pagination,
		'</nav>'
	] ) ) : '';

	$new_content .= '<script class="wpbs-layout-grid-args" type="application/json">' . wp_json_encode( [
			'card'  => WPBS::get_block_template( $block->inner_blocks[0]->parsed_block ?? [] ),
			//'query' => $query->query,
			'attrs' => array_filter( $attributes, function ( $attribute ) {
				return str_starts_with( $attribute, 'wpbs-loop' ) || $attribute == 'queryArgs';
			}, ARRAY_FILTER_USE_KEY ),
		] ) . '</script>';


	$block->inner_content[1] = trim( $new_content );

	echo join( ' ', $block->inner_content );

} else {
	echo $content;
}
