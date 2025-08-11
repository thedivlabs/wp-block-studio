<?php

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-review-card loop-card swiper-slide w-full flex flex-col relative',
		$attributes['uniqueId'] ?? ''
	] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );


?>


<div <?php echo $wrapper_attributes ?>>
	<?php echo $content ?? false ?>
</div>


