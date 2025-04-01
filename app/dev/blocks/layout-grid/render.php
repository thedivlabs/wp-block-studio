<?php

$attributes = $attributes ?? [];
$block      = $block ?? ( (object) [] );
$content    = $content ?? false;


$attributes['wpbs-prop-row-gap'] = WPBS::parse_wp_css_variable( $attributes['style']['spacing']['blockGap']['left'] ?? '0px' );
$attributes['wpbs-prop-col-gap'] = WPBS::parse_wp_css_variable( $attributes['style']['spacing']['blockGap']['top'] ?? '0px' );

$is_loop = in_array( 'is-style-loop', array_values( array_filter( explode( ' ', $attributes['className'] ?? '' ) ) ) );

$css = WPBS_Style::block_styles( $attributes ?? false, $block ?? false );

add_filter( 'wpbs_preload_images_responsive', function ( $images ) use ( $block ) {

	$block_images = array_map( function ( $image ) use ( $block ) {
		return array_merge( $image, [
			'breakpoint' => WPBS_Style::get_breakpoint( $block->attributes )
		] );
	}, $block->attributes['preload'] ?? [] );

	return array_merge( $images, $block_images );


} );

if ( $is_loop ) {
	$block_template = $block->parsed_block['innerBlocks'][0] ?? false;

	if ( empty( $block_template ) ) {
		echo 'No template';

		return false;
	}

	$custom_query = $block->attributes['queryArgs'] ?? [];

	$query = new WP_Query( [
		'post_type'      => 'post',
		'posts_per_page' => $custom_query['per_page'] ?? 2,
	] );

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