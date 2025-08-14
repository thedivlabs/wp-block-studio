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
	'overview' => get_field('wpbs_content_overview', $service_id),
	'description' => get_field('wpbs_content_description', $service_id),
	'text' => get_field('wpbs_content_text', $service_id),
	'poster' => get_field('wpbs_media_featured_poster', $service_id),
	'thumbnail' => get_field('wpbs_media_featured_thumbnail', $service_id),
	'icon' => get_field('wpbs_media_featured_icon', $service_id),
	'related-title' => get_field('wpbs_content_related_content_title', $service_id),
	'related-text' => get_field('wpbs_content_related_content_text', $service_id),
	'cta-title' => get_field('wpbs_content_cta_content_title', $service_id),
	'cta-text' => get_field('wpbs_content_cta_content_text', $service_id),
	'cta-image' => get_field('wpbs_content_cta_media', $service_id),
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
	'style' => trim( join( ' ', [ $style_attribute ?? '', ] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );

$is_link = ! empty( $settings['link'] );

?>

<?php


if ( $is_link ) {
	echo '<a href="' . $service->reviews_page . '" target="_blank" ' . $wrapper_attributes . '>';
} else {
	echo '<div ' . $wrapper_attributes . '>';
}

switch ( $type ) {
	case 'title':
		echo get_the_title( $service_id );
		break;
	case 'phone':
		echo $service->get_phone( [
			'class' => $element_class
		] );
		break;
	case 'email':
		echo $service->get_email( [
			'class' => $element_class
		] );
		break;
	case 'address':
	case 'address-inline':
		echo $service->get_address( [
			'class'  => $element_class,
			'inline' => $type == 'address-inline'
		] );
		break;
	case 'description':
		echo $service->summary();
		break;
	case 'reviews-link':
	case 'new-review-link':
	case 'directions-link':
	case 'map-link':
		echo $settings['label'] ?? false;
		break;

	case 'hours':
	case 'hours-inline':
		$service->get_hours( [
			'inline' => $type == 'hours-inline'
		] );
		break;
	default:
		echo '';
}


if ( $is_link ) {
	echo '</a>';
} else {
	echo '</div>';
}

?>


