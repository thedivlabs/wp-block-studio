<?php

$settings = $attributes['wpbs-company-map'] ?? false;

$companies = array_map( function ( $id ) {
	return new WPBS_Place( $id );
}, $settings['company'] ?? [] );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'               => implode( ' ', array_filter( [
		'wpbs-company-map flex aspect-banner w-full',
		$attributes['uniqueId'] ?? ''
	] ) ),
	'data-wp-interactive' => 'wpbs/company-map',
	'data-wp-init'        => 'actions.init',
	'data-wp-context'     => json_encode( [
		'companies' => array_map( function ( $company ) {
			return [
				'id'      => $company->id,
				'lat'     => $company->latitude,
				'lng'     => $company->longitude,
				'marker'  => $company->get_marker_url(),
				'map_url' => $company->map_page,
			];
		}, $companies ),
		'marker'    => ! empty( $settings['marker'] ),
		'zoom'      => ! empty( $settings['zoom'] ),
	] ),
	...( $attributes['wpbs-props'] ?? [] )
] );

?>

<div <?= $wrapper_attributes ?>></div>