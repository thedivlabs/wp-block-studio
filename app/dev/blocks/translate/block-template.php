<?php

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-translate',
		$attributes['uniqueId'] ?? ''
	] ) )
] );

?>


<div <?php echo $wrapper_attributes ?>>

	<?php echo do_shortcode( '[gtranslate]' ); ?>
    
</div>
