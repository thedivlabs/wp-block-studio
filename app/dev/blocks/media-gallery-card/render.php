<?php

WPBS_Blocks::render_block_styles( $attributes ?? false );

$media = $block->context['media'] ?? false;
$index = $block->context['index'] ?? 0;

if ( empty( $media ) ) {
	return false;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'               => implode( ' ', array_filter( [
		'wpbs-media-gallery-card flex w-full h-max wpbs-lightbox-card loop-card relative',
		$attributes['uniqueId'] ?? ''
	] ) ),
	'data-index'          => intval( $index ?? 0 ),
	'data-wp-interactive' => 'wpbs/media-gallery-card',
	'data-wp-init'        => 'actions.init',
	'data-wp-context'     => json_encode( array_filter( [
		'index' => intval( $index ?? 0 ),
	] ) ),
] );

?>


<div <?php echo $wrapper_attributes ?>>
	<?php

	echo wp_get_attachment_image( $media['poster'] ?? $media['id'], 'medium', false, [
		'loading' => 'lazy',
		'class'   => 'w-full h-full object-cover flex overflow-hidden'
	] );


	?>
</div>
