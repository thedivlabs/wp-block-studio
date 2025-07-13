<?php

$is_image = str_contains( $attributes['className'] ?? '', 'is-style-image' );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'      => implode( ' ', array_filter( [
		'wpbs-slide',
		$is_image ? 'wpbs-slide--image' : null,
		'wpbs-has-container swiper-slide w-full flex flex-col shrink-0 relative',
		$attributes['uniqueId'] ?? ''
	] ) ),
	'data-index' => intval( $block->context['index'] ?? null ) ?: null
] );

?>


<div <?php echo $wrapper_attributes ?>>

	<?php echo $content ?? ''; ?>


</div>
