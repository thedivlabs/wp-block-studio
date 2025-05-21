<?php


$term_id = $block->context['wpbs/termId'] ?? get_queried_object()->term_id ?? false;

$term = get_term( $term_id );

if ( empty( $term ) ) {
	return;
}

$type = str_replace( 'is-style-', '', strtolower( array_values( array_filter( explode( ' ', $attributes['className'] ?? '' ), function ( $value ) {
	return str_contains( $value, 'is-style' );
} ) )[0] ?? 'name' ) );

$content = match ( $type ) {
	'description' => $term->description,
	default => $term->name
};

if ( empty( $content ) ) {
	return;
}


?>

<div <?= get_block_wrapper_attributes( [
	'class' => 'wpbs-term-details'
] ) ?>>
	<?= $content ?>
</div>


