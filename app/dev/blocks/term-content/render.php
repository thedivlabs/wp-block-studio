<?php

$term_id = ! empty( $block->context['wpbs/termId'] ) ? $block->context['wpbs/termId'] : get_queried_object()?->term_id ?? false;
$term    = get_term( $term_id );

if ( empty( $term ) ) {
	return false;
}

$settings = $attributes['wpbs-term-content'] ?? false;
$type     = $settings['type'] ?? false;

$term_ref = "{$term->taxonomy}_{$term->term_id}";

$content = match ( $type ) {
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

if ( empty( $content ) ) {
	return;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-term-details inline-block',
		! empty( $settings['line-clamp'] ) ? '--line-clamp' : null,
		$attributes['uniqueId'] ?? ''
	] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );

$is_link = ! empty( $settings['link-post'] );

$link_target = ! empty( $settings['link-post']['linkNewTab'] ) ? '_blank' : '_self';
$link_rel    = $settings['link-post']['linkRel'] ?? '';
$link_title  = $settings['link-post']['linkTitle'] ?? '';

$loading = ! empty( $settings['eager'] ) ? 'eager' : 'lazy';

if ( $is_link ) {
	echo '<a href="' . get_the_id() . '" target="' . $link_target . '" ' . $wrapper_attributes . ' title="' . $link_title . '">';
} else {
	echo '<div ' . $wrapper_attributes . '>';
}

switch ( $type ) {
	case 'poster':
	case 'thumbnail':
	case 'cta-image':
		echo wp_get_attachment_image( $content, ( $settings['resolution'] ?? 'large' ), false, [
			'loading' => $loading,
			'class'   => 'w-full h-full object-cover'
		] );
		break;
	case 'featured-image':
		echo WPBS::picture(
			$content['mobile'] ?? false,
			$content['large'] ?? false,
			$attributes['wpbs-breakpoint']['large'] ?? false,
			$settings['resolution'] ?? false, $loading );
		break;
	default:
		echo $content;
}


if ( $is_link ) {
	echo '</a>';
} else {
	echo '</div>';
}


