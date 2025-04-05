<?php

global $wp_query;

$attributes        = $attributes ?? [];
$block             = $block ?? ( (object) [] );
$content           = $content ?? false;
$breakpoints       = WPBS_Style::get_breakpoint();
$breakpoint_mobile = $breakpoints[ $attributes['wpbs-breakpoint-mobile'] ?? 'xs' ];
$breakpoint_small  = $breakpoints[ $attributes['wpbs-breakpoint-small'] ?? 'md' ];
$breakpoint_large  = $breakpoints[ $attributes['wpbs-layout-breakpoint'] ?? $attributes['wpbs-breakpoint-large'] ?? 'normal' ];

$selector = match ( true ) {
	! empty( $attributes['uniqueId'] ) => '.' . join( '.', explode( ' ', $attributes['uniqueId'] ) ),
	! empty( $attributes['className'] ) => '.' . join( '.', explode( ' ', $attributes['className'] ) ),
	default => false
};

$attributes['wpbs-prop-row-gap']    = WPBS::parse_wp_css_variable( $attributes['style']['spacing']['blockGap']['left'] ?? '0px' );
$attributes['wpbs-prop-column-gap'] = WPBS::parse_wp_css_variable( $attributes['style']['spacing']['blockGap']['top'] ?? '0px' );

$is_loop = in_array( 'is-style-loop', array_values( array_filter( explode( ' ', $attributes['className'] ?? '' ) ) ) );

if ( $is_loop ) {

	$block_template = $block->parsed_block['innerBlocks'][0] ?? false;

	if ( empty( $block_template ) || empty( $block->attributes['queryArgs'] ) ) {
		echo 'No template';

		return false;
	}

	$custom_query = &$block->attributes['queryArgs'];

	$query_args = [
		'post_type'      => $custom_query['post_type'] ?? 'post',
		'posts_per_page' => $custom_query['posts_per_page'] ?? get_option( 'posts_per_page' ),
		'order'          => $custom_query['order'] ?? 'DESC',
		'orderby'        => $custom_query['orderby'] ?? 'date',
		'no_found_rows'  => true,
		'post__not_in'   => $custom_query['post__not_in'] ?? [],
	];

	if (
		! empty( $custom_query['term'] ) &&
		$taxonomy = $custom_query['taxonomy'] ?? get_term( $custom_query['term'] )->taxonomy ?? false
	) {

		$query_args['tax_query'] = [
			[
				'taxonomy' => $taxonomy,
				'field'    => 'term_id',
				'terms'    => $custom_query['term'],
			]
		];
	}

	$query = match ( true ) {
		$attributes['wpbs-loop-type'] === 'current' => $wp_query,
		default => new WP_Query( $query_args )
	};

	$new_content = '';

	if ( $query->have_posts() ) {


		while ( $query->have_posts() ) {
			$query->the_post();

			$query->setup_postdata( $query->post );

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

	$new_content .= trim( join( ' ', [
		'<nav class="wpbs-layout-grid-pagination">',
		paginate_links( array(
			'base'    => str_replace( 99999, '%#%', esc_url( get_pagenum_link( 99999 ) ) ),
			'format'  => '?paged=%#%',
			'current' => max( 1, get_query_var( 'paged' ) ),
			'total'   => $query->max_num_pages
		) ),
		'</nav>'
	] ) );

	$block->inner_content[1] = trim( $new_content );

	echo join( ' ', $block->inner_content );

} else {
	echo $content;
}

$total = ! empty( $query ) ? count( $query->posts ?? [] ) : count( $block->parsed_block['innerBlocks'] ?? [] );

$cols_mobile     = intval( $attributes['wpbs-columns-mobile'] ?? false ) ?: 1;
$cols_small      = intval( $attributes['wpbs-columns-small'] ?? false ) ?: 2;
$cols_large      = intval( $attributes['wpbs-columns-large'] ?? $attributes['wpbs-columns-small'] ?? $attributes['wpbs-columns-mobile'] ?? false ) ?: 1;
$last_row_mobile = ( $total - ( floor( $total / $cols_mobile ) * $cols_mobile ) ) ?: $cols_mobile;
$last_row_small  = ( $total - ( floor( $total / $cols_small ) * $cols_small ) ) ?: $cols_small;
$last_row_large  = ( $total - ( floor( $total / $cols_large ) * $cols_large ) ) ?: $cols_large;

$custom_css = '';

if ( ! empty( $cols_mobile ) ) {

	$custom_css .= '@media screen and (max-width: calc(' . ( $breakpoint_mobile ) . ' - 1px)) {';

	$custom_css .= $selector . '{ --columns: ' . $cols_mobile . ' }';

	if ( ! empty( $attributes['wpbs-divider'] ) ) {
		$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( -n+' . $cols_mobile . '):after { height: calc(100% + (var(--row-gap, var(--column-gap)) / 2));top: 0; }';
		$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' . $cols_mobile . 'n ):before { width: calc(100% + calc(var(--column-gap) / 2)) !important; }';
		$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type( -n+' . $last_row_mobile . ' ):after { height: calc(100% + calc(var(--row-gap, var(--column-gap)) / 2)) !important; }';
		$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type( -n+' . $last_row_mobile . ' ):before { content: none; }';
		$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' . $cols_mobile . 'n+1 ):after { content: none; }';
		$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' . $cols_mobile . 'n+1 ):before { width: ' . ( $cols_mobile > 1 ? 'calc(100% + calc(var(--column-gap) / 2))' : '100%' ) . ' !important;left: 0; }';
	}

	$custom_css .= '} ';
}


if ( ! empty( $cols_small ) ) {

	$custom_css .= '@media screen and (min-width: ' . $breakpoint_small . ') and (max-width: calc(' . $breakpoint_large . ' - 1px)) {';

	$custom_css .= $selector . '{ --columns: ' . $cols_small . ' }';

	if ( ! empty( $attributes['wpbs-divider'] ) ) {
		$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( -n+' . $cols_small . '):after { height: calc(100% + (var(--row-gap, var(--column-gap)) / 2));top: 0; }' . "\r\n";
		$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' . $cols_small . 'n ):before { width: calc(100% + calc(var(--column-gap) / 2)) !important; }' . "\r\n";
		$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type( -n+' . $last_row_small . ' ):after { height: calc(100% + calc(var(--row-gap, var(--column-gap)) / 2)) !important; }' . "\r\n";
		$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type( -n+' . $last_row_small . ' ):before { content: none; }' . "\r\n";
		$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' . $cols_small . 'n+1 ):after { content: none; }' . "\r\n";
		$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' . $cols_small . 'n+1 ):before { width: ' . ( $cols_small > 1 ? 'calc(100% + calc(var(--column-gap) / 2))' : '100%' ) . ' !important;left: 0; }' . "\r\n";
	}

	$custom_css .= '} ';
}

if ( ! empty( $cols_large ) ) {
	$custom_css .= '@media screen and (min-width: ' . ( $breakpoint_large ) . ') {';

	$custom_css .= $selector . '{ --columns: ' . $cols_large . ' }';

	if ( ! empty( $attributes['wpbs-divider'] ) ) {
		$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( -n+' . $cols_large . '):after { height: calc(100% + (var(--row-gap, var(--column-gap)) / 2));top: 0; }' . "\r\n";
		$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' . $cols_large . 'n ):before { width: calc(100% + calc(var(--column-gap) / 2)); }' . "\r\n";
		$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type( -n+' . $last_row_large . ' ):not(:nth-of-type( -n+' . $last_row_large . ' )):after { height: calc(100% + calc(var(--row-gap, var(--column-gap)) / 2)) !important; }' . "\r\n";
		$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type( -n+' . $last_row_large . ' ):after { height: 100% !important; }' . "\r\n";
		$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type( -n+' . $last_row_large . ' ):before { content: none !important; }' . "\r\n";
		$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' . $cols_large . 'n+1 ):after { content: none !important; }' . "\r\n";
		$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' . $cols_large . 'n+1 ):before { width: ' . ( $cols_large > 1 ? 'calc(100% + calc(var(--column-gap) / 2))' : '100%' ) . '; left: 0; }' . "\r\n";
	}

	$custom_css .= '} ';
}


$css = WPBS_Style::block_styles( $attributes ?? false, $block ?? false, $custom_css );


add_filter( 'wpbs_preload_images_responsive', function ( $images ) use ( $block, $breakpoint_large ) {

	$block_images = array_map( function ( $image ) use ( $block, $breakpoint_large ) {
		return array_merge( $image, [
			'breakpoint' => $breakpoint_large
		] );
	}, $block->attributes['preload'] ?? [] );

	return array_merge( $images, $block_images );


} );