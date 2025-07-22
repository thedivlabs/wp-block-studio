<?php

add_filter( 'wpbs_critical_css', function ( $css_array ) {

	$css_array['wpbs-site-header-settings'] = '';

	$breakpoints    = wp_get_global_settings()['custom']['breakpoints'] ?? [];
	$header_height = wp_get_global_settings()['custom']['header']['height'] ?? [];


	$css_array['wpbs-site-header-settings'] .= ':root {';
	$css_array['wpbs-site-header-settings'] .= '--wpbs-header-height: ' . $header_height['xs'] . ';';

	foreach ( array_filter($header_height, function($bp){
		return $bp != 'xs';
	}, ARRAY_FILTER_USE_KEY) as $bp => $height ) {
		$css_array['wpbs-site-header-settings'] .= '@media (min-width: ' . $breakpoints[ $bp ] . '){--wpbs-header-height: ' . $height . '}';
	}

	$css_array['wpbs-site-header-settings'] .= '}';

	return $css_array;


} );

echo $content ?? false;