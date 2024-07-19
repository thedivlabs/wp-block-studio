<?php

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}


add_action( 'init', function () {
	register_block_type( get_stylesheet_directory() . '/blocks/content-section/' );
} );