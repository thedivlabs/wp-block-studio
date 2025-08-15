<?php

$postId = $_GET['postId'] ?? $attributes['postId'] ?? $context['wpbs/postId'] ?? false;

if ( empty( $postId ) ) {
	return;
}

$fields = get_field( 'wpbs', $postId );

if ( empty( $fields ) || empty( $content ) ) {
	return;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-team-member-profile',
		$attributes['uniqueId'] ?? ''
	] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );

?>


<div <?= $wrapper_attributes ?>>

	<?= $content ?>

</div>
