<?php


$term_id = $block->context['wpbs/termId'] ?? false;

$term = $term_id ? get_term( $term_id ) : ( is_tax() ? get_queried_object() : false );

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


