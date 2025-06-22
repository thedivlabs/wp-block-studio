<?php

WPBS_Blocks::render_block_styles( $attributes ?? false );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'               => implode( ' ', array_filter( [
		'wpbs-media-gallery-card wpbs-lightbox-card loop-card',
		sanitize_html_class( $attributes['uniqueId'] ?? '' ),
		sanitize_html_class( $attributes['cardClass'] ?? '' ),
	] ) ),
	'data-index'          => intval( $attributes['index'] ?? 0 ),
	'data-wp-interactive' => 'wpbs/media-gallery-card',
	'data-wp-init'        => 'actions.init',
	'data-wp-context'     => json_encode( array_filter( [
		'index' => intval( $attributes['index'] ?? 0 ),
	] ) ),
] );

?>


<figure <?php echo $wrapper_attributes ?>>
	<?= wp_get_attachment_image( $attributes['postId'] ?? false, 'medium', false, [
		'loading' => 'lazy',
		'class'   => 'w-full h-full object-cover'
	] ) ?>
</figure>
