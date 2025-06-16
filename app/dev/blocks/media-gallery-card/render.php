<?php

global $wp_query;

WPBS_Blocks::render_block_styles( $attributes ?? false );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'               => implode( ' ', array_filter( [
		'wpbs-media-gallery-card layout-grid-card',
		$attributes['uniqueId'] ?? null
	] ) ),
	'data-index'          => $attributes['index'] ?? null,
	'data-wp-interactive' => 'wpbs',
	'data-wp-init'        => 'callbacks.observe',
] );


WPBS::console_log( $block );

?>


<figure <?php echo $wrapper_attributes ?>>
	<?= wp_get_attachment_image( $attributes['postId'] ?? false, 'medium', false, [
		'loading' => 'lazy',
		'class'   => 'w-full h-full object-cover'
	] ) ?>
</figure>
