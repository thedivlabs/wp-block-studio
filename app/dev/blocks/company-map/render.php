<?php

$settings = $attributes['wpbs-company-map'] ?? false;

$company_id = $settings['company-id'] ?? [];

WPBS::console_log( $settings );
WPBS::console_log( $attributes );

if ( empty( $company_id ) ) {
	return;
}

$companies = array_map( function ( $id ) use ( $company_id ) {
	return new WPBS_Place( $id );
}, $company_id );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'               => implode( ' ', array_filter( [
		'wpbs-company-map inline-block',
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
		'default'   => ! empty( $settings['default-marker'] ),
		'zoom'      => ! empty( $settings['zoom-to-fit'] ),
	] ),
	...( $attributes['wpbs-props'] ?? [] )
] );

?>

<figure <?= $wrapper_attributes ?>></figure>