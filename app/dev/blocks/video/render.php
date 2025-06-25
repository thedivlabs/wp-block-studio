<?php

WPBS_Blocks::render_block_styles( $attributes ?? false );

$imageId = $block->context['imageId'] ?? false;
$index   = $block->context['index'] ?? false;

if ( empty( $imageId ) ) {
	return false;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-video',
		$attributes['uniqueId'] ?? ''
	] ) )
] );

?>


<div <?php echo $wrapper_attributes ?>>
    VIDEO
</div>
