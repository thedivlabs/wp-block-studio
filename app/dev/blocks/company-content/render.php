<?php

$settings = $attributes['wpbs-company-content'] ?? false;

if ( empty( $settings ) ) {
	return;
}

$type       = $settings['type'] ?? false;
$company_id = intval( $settings['company-id'] ?? false );

if ( ! $type || ! $company_id ) {
	return;
}

$company = new WPBS_Place( $company_id );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-company-content inline-block',
		! empty( $settings['line-clamp'] ) ? '--line-clamp' : null,
		! empty( $settings['icon'] ) ? '--icon material-icon-before' : null,
		! empty( $settings['label-position'] ) ? '--label-' . $settings['label-position'] : null,
		$attributes['uniqueId'] ?? ''
	] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );

$is_link = in_array( $type, [ 'reviews-link', 'map-link', 'directions-link' ], true );
$link    = ! $is_link ? false : match ( $type ) {
	'reviews-link' => $company->reviews_page,
	'map-link' => $company->map_page,
	'directions-link' => $company->directions_page,
	default => false
};

$element_class = '';

?>

<?php


if ( $is_link ) {
	echo '<a href="' . $company->reviews_page . '" target="_blank" ' . $wrapper_attributes . '>';
} else {
	echo '<div ' . $wrapper_attributes . '>';
}

switch ( $type ) {
	case 'title':
		echo get_the_title( $company_id );
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
			'inline' => $type == 'address-inline',
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
		echo $settings['label'] ?? false;
		break;

	case 'hours':
	case 'hours-inline':
		$company->get_hours( [
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


