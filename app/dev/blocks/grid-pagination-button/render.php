<?php


$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-grid-pagination-button loop-button min-h-10 px-4 relative z-20 hidden cursor-pointer h-fit',
	] ) )
] );

$label = $block->context['label'] ?? 'View More';

?>

<button <?= $wrapper_attributes ?> data-wp-on-async--click="actions.pagination">
    <span><?= $label ?></span>
</button>


