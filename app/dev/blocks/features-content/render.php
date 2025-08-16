<?php

$settings = $attributes['wpbs-features-content'] ?? false;

if ( empty( $settings ) ) {
	return;
}

$type       = $settings['type'] ?? false;
$feature_id = ( $settings['feature-id'] ?? false ) == 'current' ? get_the_ID() : intval( $settings['feature-id'] ?? false );

if ( ! $type || ! $feature_id ) {
	return;
}

$content = match ( $type ) {
	'title' => get_the_title( $feature_id ),
	'overview' => get_field( 'wpbs_content_overview', $feature_id ),
	'description' => get_field( 'wpbs_content_description', $feature_id ),
	'text' => get_field( 'wpbs_content_text', $feature_id ),
	'poster' => get_field( 'wpbs_media_featured_poster', $feature_id ),
	'thumbnail' => get_field( 'wpbs_media_featured_thumbnail', $feature_id ),
	'icon' => get_field( 'wpbs_media_featured_icon', $feature_id ),
	'faq-title' => get_field( 'wpbs_faq_content_title', $feature_id ),
	'faq-text' => get_field( 'wpbs_faq_content_text', $feature_id ),
	'related-title' => get_field( 'wpbs_related_content_title', $feature_id ),
	'related-text' => get_field( 'wpbs_related_content_text', $feature_id ),
	'cta-title' => get_field( 'wpbs_cta_content_title', $feature_id ),
	'cta-text' => get_field( 'wpbs_cta_content_text', $feature_id ),
	'cta-image' => WPBS::clean_array( get_field( 'wpbs_cta_media', $feature_id ) ),
	default => null
};

if ( empty( $content ) ) {
	return false;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-features-content inline-block',
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

$element_tag = $attributes['wpbs-element-tag'] ?? 'div';

?>

<?php


if ( $is_link ) {
	echo '<a href="' . get_the_permalink( $feature_id ) . '" target="' . $link_target . '" ' . $wrapper_attributes . ' title="' . $link_title . '">';
} else {
	echo '<' . $element_tag . ' ' . $wrapper_attributes . '>';
}

switch ( $type ) {
	case 'poster':
	case 'thumbnail':
		echo wp_get_attachment_image( $content, ( $settings['resolution'] ?? 'large' ), false, [
			'loading' => $loading,
			'class'   => 'w-full h-full object-cover'
		] );
		break;
	case 'cta-image':

		echo WPBS::picture(
			$content['image_mobile'] ?? false,
			$content['image_large'] ?? false,
			$attributes['wpbs-breakpoint']['large'] ?? false,
			$settings['resolution'] ?? false, $loading );
		break;
	default:
		echo $content;
}


if ( $is_link ) {
	echo '</a>';
} else {
	echo '</' . $element_tag . '>';
}

?>


