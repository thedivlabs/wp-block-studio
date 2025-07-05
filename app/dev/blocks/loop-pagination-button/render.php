<?php


$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-loop-pagination-button inline-block loop-button relative z-20 hidden cursor-pointer h-fit',
	] ) )
] );

$label = $block->context['label'] ?? 'View More';

?>

<button <?= $wrapper_attributes ?> data-wp-on-async--click="actions.pagination">
    <span><?= $label ?></span>
</button>


