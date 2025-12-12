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
 * Link handling (block-created links only)
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
 * Detect pre-wrapped semantic HTML
 */
$inner_is_anchor =
	str_starts_with( $inner, '<a ' ) ||
	str_starts_with( $inner, '<a>' );

/**
 * Decide wrapper
 */
if ( $is_link && ! empty( $link ) ) {
	// This block creates the link
	$replacement =
		'<a href="' . esc_url( $link ) . '" target="_blank" rel="noopener">' .
		$inner .
		'</a>';
} elseif ( $inner_is_anchor || ( ! $has_icon && ! $has_label ) ) {
	// Already semantic or no layout wrapper needed
	$replacement = $inner;
} else {
	// Layout wrapper only
	$replacement =
		'<div>' .
		$inner .
		'</div>';
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
