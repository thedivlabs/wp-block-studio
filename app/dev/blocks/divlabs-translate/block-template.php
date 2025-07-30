<?php


$class = implode( ' ', array_filter( [
	'divlabs-translate',
	! empty( $fields['options']['flag'] ) ? 'divlabs-translate--flag' : null
] ) );

if ( ! shortcode_exists( 'gtranslate' ) ) {
	return false;
}

?>


<div <?= DIVLABS::block_attributes( [
	'class' => $class
], $block ?? false ) ?>
>
	<?= do_shortcode( '[gtranslate]' ) ?>
</div>