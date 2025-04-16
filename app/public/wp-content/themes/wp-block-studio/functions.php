<?php

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

require_once __DIR__ . '/core/class-wpbs.php';

if ( class_exists( 'WPBS' ) ) {
	$wpbs = WPBS::init();
}


add_filter( 'block_type_metadata', function ( $metadata ) {
	if ( $metadata['name'] === 'core/query-pagination' ) {
		$metadata['ancestor'][] = 'wpbs/layout-grid';
	}

	return $metadata;
}, 1 );

