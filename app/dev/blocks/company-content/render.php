<?php
declare( strict_types=1 );

// Always start with content
$content = $content ?? '';

$settings = $attributes['wpbs-company-content'] ?? false;
if ( empty( $settings ) || ! is_array( $settings ) ) {
	echo $content;

	return;
}

$type = $settings['type'] ?? false;
if ( ! $type ) {
	echo $content;

	return;
}

$has_icon  = ! empty( $settings['icon'] );
$has_label = ! empty( $settings['label'] );

/**
 * Types that must always be wrapped even without icon/label
 * (layout-dependent or multi-node output)
 */
$force_wrap_types = [
	'social',
	'hours',
	'hours-inline',
	'address',
	'address-inline',
];

$force_wrap = in_array( $type, $force_wrap_types, true );

/**
 * Resolve company ID
 */
$raw_company_id = $settings['company-id'] ?? false;

if ( $raw_company_id === 'current' ) {
	$company_id = (int) get_the_ID();
} else {
	$company_id = (int) $raw_company_id;
}

if ( ! $company_id ) {
	echo $content;

	return;
}

$company = new WPBS_Place( $company_id );

/**
 * Link handling
 */
$is_link = in_array(
	$type,
	[ 'reviews-link', 'map-link', 'directions-link' ],
	true
);

$link = $is_link
	? match ( $type ) {
		'reviews-link' => $company->reviews_page,
		'map-link' => $company->map_page,
		'directions-link' => $company->directions_page,
		default => false,
	}
	: false;

/**
 * Build inner content
 */
ob_start();

switch ( $type ) {
	case 'title':
		echo esc_html( get_the_title( $company_id ) );
		break;

	case 'phone':
		echo $company->get_phone();
		break;

	case 'email':
		echo $company->get_email();
		break;

	case 'address':
	case 'address-inline':
		echo $company->get_address( [
			'inline' => ( $type === 'address-inline' ),
			...$settings,
		] );
		break;

	case 'description':
		echo $company->summary();
		break;

	case 'reviews-link':
	case 'new-review-link':
	case 'directions-link':
	case 'map-link':
		echo ! empty( $settings['label'] )
			? esc_html( (string) $settings['label'] )
			: '';
		break;

	case 'hours':
	case 'hours-inline':
		$company->get_hours( [
			'inline' => ( $type === 'hours-inline' ),
		] );
		break;

	case 'social':
		( new WPBS_Social( $company->social ) )->render();
		break;

	default:
		break;
}

$inner = trim( ob_get_clean() );

if ( $inner === '' ) {
	echo $content;

	return;
}

/**
 * Wrap ONLY the dynamic element
 */
if ( $is_link && ! empty( $link ) ) {
	$replacement =
		'<a href="' . esc_url( $link ) . '" target="_blank" rel="noopener">' .
		$inner .
		'</a>';
} else {
	$replacement = $inner;
}

/**
 * Replace marker and output
 */
$content = str_replace(
	'%%__COMPANY_CONTENT__%%',
	$replacement,
	$content
);

echo $content;
