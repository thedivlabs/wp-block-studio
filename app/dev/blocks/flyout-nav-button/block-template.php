<?php

$class = implode( ' ', array_filter( [
	'divlabs-flyout-nav-button divlabs-site-nav-toggle',
	'w-auto min-h-em-lg aspect-square flex justify-center items-center text-center',
	'cursor-pointer select-none',
	! empty( $fields['options']['mobile_only'] ) ? 'xl:hidden' : null
] ) );

$icon = $fields['options']['icon'] ?? $block->attributes['icon'] ?? '<i class="fa-regular fa-bars"></i>';
?>


<button <?= DIVLABS::block_attributes( [
	'class' => $class
], $block ?? false ) ?> type="button">
    <span class="screen-reader-text">Toggle menu</span>
	<?= html_entity_decode( $icon ) ?>
</button>



