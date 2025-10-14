<?php

$settings    = $attributes['wpbs-acf-field-content'] ?? [];
$field_key   = $settings['field'] ?? '';
$date_format = $settings['dateFormat'] ?? '';

if ( ! $field_key ) {
	return '';
}

// Pull all fields once
$all_fields = get_field( 'wpbs', get_the_ID() );
$value      = $all_fields;

// Walk the dot.notation path
foreach ( explode( '.', $field_key ) as $part ) {
	if ( is_array( $value ) && array_key_exists( $part, $value ) ) {
		$value = $value[ $part ];
	} else {
		$value = null;
		break;
	}
}

if ( empty( $value ) || ! is_string( $value ) ) {
	return '';
}

// Handle date formatting if requested
if ( $date_format && strtotime( $value ) !== false ) {
	$value = date_i18n( $date_format, strtotime( $value ) );
}

$result = str_replace( "__FIELD_CONTENT__", $value, ( $content ?? '' ) );

echo $result;
