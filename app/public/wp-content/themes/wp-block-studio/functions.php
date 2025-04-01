<?php

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

require_once __DIR__ . '/core/class-wpbs.php';

if ( class_exists( 'WPBS' ) ) {
	$wpbs = WPBS::init();
}

function wpbs_layout_grid_render( $attributes, $content, $block ): string|false {

	$block_template = $block->parsed_block['innerBlocks'][0] ?? false;

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


	return trim( $new_content );
}



