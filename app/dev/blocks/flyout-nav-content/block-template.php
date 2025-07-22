<?php

$class = implode( ' ', array_filter( [
	'divlabs-flyout-nav-content',
	'w-full grow h-auto overflow-scroll scroll-smooth relative flex flex-col'
] ) );

?>


<div <?= DIVLABS::block_attributes( [
	'class' => $class
], $block ?? false ) ?>>
    <InnerBlocks/>
</div>