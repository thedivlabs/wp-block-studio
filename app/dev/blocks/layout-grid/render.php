<?php

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

echo join(' ', [
	$block->inner_content[0] ?? '',
	trim( $new_content ),
	$block->inner_content[count($block->inner_content) - 1] ?? ''
]);