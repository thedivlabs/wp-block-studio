<?php
declare( strict_types=1 );

$settings = $attributes['wpbs-company-content'] ?? false;

if ( empty( $settings ) || ! is_array( $settings ) ) {
	return;
}

$type = $settings['type'] ?? false;
if ( ! $type ) {
	return;
}

/**
 * Resolve company ID
 * - "current" => current post ID (works in loops/templates)
 * - numeric   => explicit company ID
 */
$raw_company_id = $settings['company-id'] ?? false;

if ( $raw_company_id === 'current' ) {
	$company_id = (int) get_the_ID();
} else {
	$company_id = (int) $raw_company_id;
}

if ( ! $company_id ) {
	return;
}

$company = new WPBS_Place( $company_id );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-company-content inline-block',
		$type === 'social' ? 'wpbs-social-links' : null,
		! empty( $settings['line-clamp'] ) ? '--line-clamp' : null,
		! empty( $settings['icon'] ) ? '--icon material-icon-before' : null,
		! empty( $settings['label-position'] ) ? '--label-' . $settings['label-position'] : null,
		$attributes['uniqueId'] ?? ''
	] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );

$is_link = in_array( $type, [ 'reviews-link', 'map-link', 'directions-link' ], true );

$link = ! $is_link ? false : match ( $type ) {
	'reviews-link' => $company->reviews_page,
	'map-link' => $company->map_page,
	'directions-link' => $company->directions_page,
	default => false
};

$element_class = '';

if ( $is_link && ! empty( $link ) ) {
	echo '<a href="' . esc_url( $link ) . '" target="_blank" rel="noopener" ' . $wrapper_attributes . '>';
} else {
	echo '<div ' . $wrapper_attributes . '>';
}

switch ( $type ) {
	case 'title':
		echo esc_html( get_the_title( $company_id ) );
		break;

	case 'phone':
		echo $company->get_phone( [
			'class' => $element_class
		] );
		break;

	case 'email':
		echo $company->get_email( [
			'class' => $element_class
		] );
		break;

	case 'address':
	case 'address-inline':
		echo $company->get_address( [
			'class'  => $element_class,
			'inline' => ( $type === 'address-inline' ),
			...$settings
		] );
		break;

	case 'description':
		echo $company->summary();
		break;

	case 'reviews-link':
	case 'new-review-link':
	case 'directions-link':
	case 'map-link':
		echo ! empty( $settings['label'] ) ? esc_html( (string) $settings['label'] ) : '';
		break;

	case 'hours':
	case 'hours-inline':
		$company->get_hours( [
			'inline' => ( $type === 'hours-inline' )
		] );
		break;

	case 'social':
		( new WPBS_Social( $company->social ) )->render();
		break;

	default:
		echo '';
		break;
}

if ( $is_link && ! empty( $link ) ) {
	echo '</a>';
} else {
	echo '</div>';
}
