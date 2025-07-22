<?php

add_filter( 'wpbs_critical_css', function ( $css_array ) {

	$css_array['wpbs-site-header-settings'] = '';

	$breakpoints    = wp_get_global_settings()['custom']['breakpoints'] ?? [];
	$header_options = wp_get_global_settings()['custom']['header']['height'] ?? [];


	$css_array['wpbs-site-header-settings'] .= ':root {';

	foreach ( $header_options as $bp => $height ) {
		$css_array['wpbs-site-header-settings'] .= '@media (min-width: ' . $breakpoints[ $bp ] . '){--wpbs-header-height: ' . $height . '}';
	}

	$css_array['wpbs-site-header-settings'] .= '}';

	return $css_array;


} );

echo $content ?? false;