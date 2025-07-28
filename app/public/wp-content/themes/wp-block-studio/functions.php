<?php

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

require_once __DIR__ . '/core/class-wpbs.php';

if ( class_exists( 'WPBS' ) ) {
	$wpbs = WPBS::init();
}


add_action( 'admin_enqueue_scripts', function () {
	wp_enqueue_code_editor( [
		'type' => 'text/javascript'
	] );
	wp_enqueue_style( 'wp-codemirror' );
} );