<?php

$attributes = $attributes ?? [];
$block      = $block ?? ( (object) [] );
$content    = $content ?? false;
$breakpoint = WPBS_Style::get_breakpoint( $attributes );
$selector   = match ( true ) {
	! empty( $attributes['className'] ) => '.' . join( '.', explode( ' ', $attributes['className'] ) ),
	! empty( $attributes['uniqueId'] ) => '.' . join( '.', explode( ' ', $attributes['uniqueId'] ) ),
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

	$query = new WP_Query( $query_args );

	$new_content = '';

	if ( $query->have_posts() ) {


		while ( $query->have_posts() ) {
			$query->the_post();

			global $post;

			$new_block = new WP_Block( $block_template, [
				'postId' => $post->ID,
			] );

			$new_content .= $new_block->render();
		}
	}

	$block->inner_content[1] = trim( $new_content );

	echo join( ' ', $block->inner_content );
} else {
	echo $content;
}


$total = ! empty( $query ) ? count( $query->posts ?? [] ) : count( $block->parsed_block['innerBlocks'] ?? [] );

$cols_mobile     = intval( $attributes['wpbs-columns-mobile'] ?? 1 ) ?: 1;
$cols_large      = intval( $attributes['wpbs-columns-large'] ?? $attributes['wpbs-columns-mobile'] ?? 1 ) ?: 1;
$last_row_mobile = ( $total - ( floor( $total / $cols_mobile ) * $cols_mobile ) ) ?: $cols_mobile;
$last_row_large  = ( $total - ( floor( $total / $cols_large ) * $cols_large ) ) ?: $cols_large;

$custom_css = '';

if ( ! empty( $cols_mobile ) ) {
	$custom_css .= '@media screen and (max-width: calc(' . ( $breakpoint ) . ' - 1px)) {';
	$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-child( -n+' . $cols_mobile . '):after { height: calc(100% + (var(--row-gap, var(--column-gap)) / 2));top: 0; }';
	$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-child( ' . $cols_mobile . 'n ):before { width: calc(100% + calc(var(--column-gap) / 2)) !important; }';
	$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-child( -n+' . $last_row_mobile . ' ):after { height: calc(100% + calc(var(--row-gap, var(--column-gap)) / 2)) !important; }';
	$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-child( -n+' . $last_row_mobile . ' ):before { content: none; }';
	$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-child( ' . $cols_mobile . 'n+1 ):after { content: none; }';
	$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-child( ' . $cols_mobile . 'n+1 ):before { width: ' . ( $cols_mobile > 1 ? 'calc(100% + calc(var(--column-gap) / 2))' : '100%' ) . ' !important;left: 0; }';
	$custom_css .= '}';
}


if ( ! empty( $cols_large ) ) {
	$custom_css .= '@media screen and (min-width: ' . ( $breakpoint ) . ') {';

	$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-child( -n+' . $cols_large . '):after { height: calc(100% + (var(--row-gap, var(--gap)) / 2));top: 0; }';
	$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-child( ' . $cols_large . 'n ):before { width: calc(100% + calc(var(--gap) / 2)); }';
	$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-child( -n+' . $last_row_large . ' ):not(:nth-child( -n+' . $last_row_large . ' )):after { height: calc(100% + calc(var(--row-gap, var(--gap)) / 2)) !important; }';
	$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-child( -n+' . $last_row_large . ' ):after { height: 100% !important; }';
	$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-child( -n+' . $last_row_large . ' ):before { content: none; }';
	$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-child( ' . $cols_large . 'n+1 ):after { content: none; }';
	$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-child( ' . $cols_large . 'n+1 ):before { width: ' . ( $cols_large > 1 ? 'calc(100% + calc(var(--gap) / 2))' : '100%' ) . '; left: 0; }';

	$custom_css .= '}';
}

WPBS::console_log( $selector );
WPBS::console_log( $cols_large );
WPBS::console_log( [ $custom_css ] );


$css = WPBS_Style::block_styles( $attributes ?? false, $block ?? false, $custom_css );


add_filter( 'wpbs_preload_images_responsive', function ( $images ) use ( $block ) {

	$block_images = array_map( function ( $image ) use ( $block ) {
		return array_merge( $image, [
			'breakpoint' => WPBS_Style::get_breakpoint( $block->attributes )
		] );
	}, $block->attributes['preload'] ?? [] );

	return array_merge( $images, $block_images );


} );