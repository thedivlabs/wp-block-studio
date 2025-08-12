<?php


if ( ! empty( $attributes['wpbs-company-content']['line-clamp'] ) ) {
	$style_attribute = implode( '; ', [
		'line-clamp:' . $attributes['wpbs-company-content']['line-clamp'],
		'-webkit-line-clamp:' . $attributes['wpbs-company-content']['line-clamp'],
		'display:-webkit-box',
		'-webkit-box-orient:vertical',
		'overflow:hidden',
	] );
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-company-content inline-block',
		$attributes['uniqueId'] ?? ''
	] ) ),
	'style' => trim( join( ' ', [ $style_attribute ?? '', ] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );

$type       = $attributes['wpbs-company-content']['type'] ?? false;
$company_id = $attributes['wpbs-company-content']['company-id'] ?? false;

if ( ! $type || ! $company_id ) {
	return;
}

$company_content = match ( $type ) {
	'phone' => get_field( 'wpbs_contact_phone_primary', $company_id ),
	'phone-additional' => get_field( 'wpbs_contact_phone_additional', $company_id ),
	'email' => get_field( 'wpbs_contact_email_primary', $company_id ),
	'email-additional' => get_field( 'wpbs_contact_email_additional', $company_id ),
	'address' => get_field( 'wpbs_address', $company_id ),
	'reviews-link' => get_field( 'wpbs_map_reviews_url', $company_id ),
	'new-review-link' => get_field( 'wpbs_map_new_review_url', $company_id ),
	'map-link' => get_field( 'wpbs_map_map_page_url', $company_id ),
	'directions-link' => get_field( 'wpbs_map_directions_page_url', $company_id ),
	'description' => get_field( 'wpbs_content_description', $company_id ),
	'name' => get_the_title( $company_id ),
	default => false
};

if ( ! $company_content ) {
	return false;
}
?>


<div <?php echo $wrapper_attributes ?>>
	<?php

	switch ( $type ) {
		case 'reviews-link':
			echo 'ADDRESS';
			break;
		case 'address':
			echo 'ADDRESS';
			break;
		default:
			echo $company_content;
	}


	?>
</div>


