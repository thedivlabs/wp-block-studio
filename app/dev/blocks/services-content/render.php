<?php

$settings = $attributes['wpbs-services-content'] ?? false;

if ( empty( $settings ) ) {
	return;
}

$type       = $settings['type'] ?? false;
$service_id = ( $settings['service-id'] ?? false ) == 'current' ? get_the_ID() : intval( $settings['service-id'] ?? false );

if ( ! $type || ! $service_id ) {
	return;
}

$content = match ( $type ) {
	'overview' => get_field( 'wpbs_content_overview', $service_id ),
	'description' => get_field( 'wpbs_content_description', $service_id ),
	'text' => get_field( 'wpbs_content_text', $service_id ),
	'poster' => get_field( 'wpbs_media_featured_poster', $service_id ),
	'thumbnail' => get_field( 'wpbs_media_featured_thumbnail', $service_id ),
	'icon' => get_field( 'wpbs_media_featured_icon', $service_id ),
	'faq-title' => get_field( 'wpbs_faq_content_title', $service_id ),
	'faq-text' => get_field( 'wpbs_faq_content_text', $service_id ),
	'related-title' => get_field( 'wpbs_related_content_title', $service_id ),
	'related-text' => get_field( 'wpbs_related_content_text', $service_id ),
	'cta-title' => get_field( 'wpbs_cta_content_title', $service_id ),
	'cta-text' => get_field( 'wpbs_cta_content_text', $service_id ),
	'cta-image' => WPBS::clean_array( get_field( 'wpbs_cta_media', $service_id ) ),
	default => null
};

if ( empty( $content ) ) {
	return false;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-services-content inline-block',
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

?>

<?php


if ( $is_link ) {
	echo '<a href="' . get_the_id() . '" target="' . $link_target . '" ' . $wrapper_attributes . ' title="' . $link_title . '">';
} else {
	echo '<div ' . $wrapper_attributes . '>';
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
	echo '</div>';
}

?>


