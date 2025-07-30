<?php


$class = implode( ' ', array_filter( [
	'divlabs-archive-filters flex',
] ) );

$action = DIVLABS::$helper->search_action();

?>


<form <?= DIVLABS::block_attributes( [
	'class' => $class,
	'style' => [
		'--text-color'              => $block->attributes['text-color'] ?? null,
		'--background-color'        => $block->attributes['background-color'] ?? null,
		'--button-text-color'       => $block->attributes['button-text-color'] ?? null,
		'--button-text-hover-color' => $block->attributes['button-text-hover-color'] ?? null,
		'--button-color'            => $block->attributes['button-color'] ?? null,
		'--button-hover-color'      => $block->attributes['button-hover-color'] ?? null,
		'--placeholder-color'       => $block->attributes['placeholder-color'] ?? null,
		'--field-border-color'      => $block->attributes['field-border-color'] ?? null,
		'--field-border'            => $block->attributes['field-border'] ?? null,
		'--field-rounded'           => $block->attributes['field-rounded'] ?? null,
		'--field-padding'           => $block->attributes['field-padding'] ?? null,
	]
], $block ?? false ) ?> method="get" action="<?= $action ?>">

    <InnerBlocks/>

</form>