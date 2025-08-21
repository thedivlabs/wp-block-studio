<?php

$term_id = ! empty( $block->context['wpbs/termId'] ) ? $block->context['wpbs/termId'] : get_queried_object()?->term_id ?? false;

if ( ! $term_id ) {
	return;
}

$term = get_term( $term_id );

if ( ! is_a( $term, 'WP_Term' ) ) {
	return false;
}

$settings = $attributes['wpbs-term-content'] ?? false;
$type     = $settings['type'] ?? false;

$term_ref = "{$term->taxonomy}_{$term->term_id}";

$dynamic_content = match ( $type ) {
	'title' => $term->name,
	'description' => $term->description,
	'poster' => get_field( 'wpbs_media_poster', $term_ref ),
	'thumbnail' => get_field( 'wpbs_media_thumbnail', $term_ref ),
	'featured-image' => WPBS::clean_array( [
		'large'  => get_field( 'wpbs_media_featured_image_large', $term_ref ),
		'mobile' => get_field( 'wpbs_media_featured_image_mobile', $term_ref ),
	] ),
	'related-title' => get_field( 'wpbs_related_title', $term_ref ),
	'related-text' => get_field( 'wpbs_related_text', $term_ref ),
	'content-title' => get_field( 'wpbs_content_title', $term_ref ),
	'content-text' => get_field( 'wpbs_content_text', $term_ref ),
	'cta-title' => get_field( 'wpbs_cta_title', $term_ref ),
	'cta-text' => get_field( 'wpbs_cta_text', $term_ref ),
	'cta-image' => get_field( 'wpbs_cta_image', $term_ref ),
	default => null
};

if ( empty( $dynamic_content ) ) {
	return;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-term-content',
		! empty( $settings['line-clamp'] ) ? '--line-clamp' : null,
		in_array( $type, [
			'featured-image',
			'poster',
			'thumbnail'
		], true ) ? 'w-full grid max-w-full max-h-full overflow-hidden' : 'w-fit inline-block',
		$attributes['uniqueId'] ?? ''
	] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );

$is_link = ! empty( $settings['link-post'] );

$link_target = ! empty( $settings['link-post']['linkNewTab'] ) ? '_blank' : '_self';
$link_rel    = $settings['link-post']['linkRel'] ?? '';
$link_title  = $settings['link-post']['linkTitle'] ?? '';
$link_class  = implode( ' ', array_filter( [
	in_array( $type, [ 'poster', 'thumbnail', 'cta-image', 'featured-image' ] ) && $is_link ? 'overflow-hidden' : null,
] ) );

$loading = ! empty( $settings['eager'] ) ? 'eager' : 'lazy';

$element_tag = $attributes['wpbs-element-tag'] ?? 'div';


echo '<' . $element_tag . ' ' . $wrapper_attributes . '>';

if ( $is_link ) {
	echo '<a href="' . get_term_link( $term ) . '" target="' . $link_target . '" ' . ' title="' . $link_title . '" class="wpbs-term-content__link ' . $link_class . '">';
}

switch ( $type ) {
	case 'poster':
	case 'thumbnail':
	case 'cta-image':
		echo wp_get_attachment_image( $dynamic_content, ( $settings['resolution'] ?? 'large' ), false, [
			'loading' => $loading,
			'class'   => 'w-full h-full object-cover'
		] );
		break;
	case 'featured-image':
		echo WPBS::picture(
			$dynamic_content['mobile'] ?? false,
			$dynamic_content['large'] ?? false,
			$attributes['wpbs-breakpoint']['large'] ?? false,
			$settings['resolution'] ?? false, $loading );
		break;
	default:
		echo $dynamic_content;
}


if ( $is_link ) {
	echo '</a>';
}

echo '</' . $element_tag . '>';


