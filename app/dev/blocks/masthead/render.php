<?php

$attributes = $attributes ?? false;


add_filter( 'body_class', function ( $classes ) use ( $attributes ) {

	if ( ! empty( $attributes['wpbs-site-header']['float'] ) ) {
		$classes[] = '--header-float';
	}

	if ( ! empty( $attributes['wpbs-site-header']['sticky'] ) ) {
		$classes[] = '--header-sticky';
	}

	return $classes;
} );


echo $content ?? false;