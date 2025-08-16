<?php

$postId = $_GET['postId'] ?? $attributes['postId'] ?? $block->context['wpbs/postId'] ?? 6467;

if ( empty( $postId ) ) {
	return;
}

$fields = get_field( 'wpbs', $postId );

if ( empty( $fields ) || empty( $content ) ) {
	return;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-team-member-profile wpbs-container',
		$attributes['uniqueId'] ?? ''
	] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );

?>


<div <?= $wrapper_attributes ?>>

	<?= $content ?? false ?>

</div>
