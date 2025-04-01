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
	WPBS::console_log($block_template);

	if ( empty($block_template) ) {
		return false;
	}

	WPBS::console_log( $block );
	WPBS::console_log( [ $content ] );

	$custom_query = $block->attributes['queryArgs'] ?? [];

	$query = new WP_Query( [
		'post_type'      => 'post',
		'posts_per_page' => $custom_query['per_page'] ?? 2,
	] );


	return 'PPPQA';
//	ob_start();

	/*if ( $query->have_posts() ) {
		while ( $query->have_posts() ) {

			echo render_block( $block_template );
		}
	}*/

	//$new_content = ob_get_clean();

	return trim( $new_content ) ?? false;
}



