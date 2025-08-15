<?php

$settings = $attributes['wpbs-faq-group'] ?? false;

if ( empty( $settings ) ) {
	return;
}

$term_id  = is_tax() ? get_queried_object()?->term_id : false;
$term     = $term_id ? get_term( $term_id ) : false;
$term_ref = $term_id ? "{$term->taxonomy}_{$term->term_id}" : false;

$faq_id = match ( true ) {
	( $settings['faq-id'] ?? false ) == 'current' && is_tax() => intval( get_field( 'wpbs_faq_group', $term_ref ) ?: get_field( 'wpbs_faq', $term_ref ) ?: false ),
	( $settings['faq-id'] ?? false ) == 'current' => intval( get_field( 'wpbs_faq_group', get_the_ID() ) ?: get_field( 'wpbs_faq', get_the_ID() ) ?: false ),
	default => intval( $settings['faq-id'] ?? false )
};

$faqs = WPBS::clean_array( get_field( 'wpbs_questions', $faq_id ) );

if ( ! $faqs ) {
	return;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-faq-group',
		! empty( $settings['icon-hide'] ) ? '--no-icon' : null,
		empty( $settings['animate'] ) ? '--static' : null,
		! empty( $settings['header-color-hover'] ) ? '--header-hover' : null,
		! empty( $settings['header-text-color-hover'] ) ? '--header-text-hover' : null,
		! empty( $settings['header-color-active'] ) ? '--header-active' : null,
		! empty( $settings['header-text-color-active'] ) ? '--header-text-active' : null,
		$attributes['uniqueId'] ?? ''
	] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );

$tag_open  = join( ' ', [
	'<' . ( $settings['tag'] ?? 'div' ),
	$wrapper_attributes,
	'>'
] );
$tag_close = '</' . ( $settings['tag'] ?? 'div' ) . '>';

$item_tag_ref = match ( $settings['tag'] ?? false ) {
	'ul', 'ol' => 'li',
	default => 'div'
};

$item_tag_open = '<' . $item_tag_ref . ' class="wpbs-faq-group__item">';

$item_tag_close = '</' . $item_tag_ref . '>';


echo $tag_open;

foreach ( $faqs as $faq ) {
	if ( empty( $faq['question'] ) || empty( $faq['answer'] ) ) {
		continue;
	}
	echo $item_tag_open;
	echo '<div class="wpbs-faq-group__header">';
	echo $faq['question'];
	echo '<button class="wpbs-faq-group__toggle">';

	/*
	 *
	 * <button className={'wpbs-accordion-group-header__toggle'}><span
					className={'screen-reader-text'}>Toggle content</span></button>
	 *
	 * */

	echo '</div>';
	echo '<div class="wpbs-faq-group__answer">';
	echo $faq['answer'];
	echo '</div>';
	echo $item_tag_close;
}

echo $tag_close;



