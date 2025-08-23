<?php
/**
 * Plugin Name: WP Block Studio
 * Plugin URI:  https://wpdivlabs.com
 * Description: A set of bespoke blocks to build your website.
 * Version:     1.0.0
 * Author:      Alex Ferrao
 * Author URI:  https://wpdivlabs.com
 * License:     Proprietary
 *
 * Copyright (c) 2025 Alex Ferrao. All Rights Reserved.
 *
 * This plugin is proprietary software. Unauthorized copying, reproduction,
 * distribution, or modification of this code, via any medium, is strictly prohibited.
 * You may not reverse-engineer, decompile, or otherwise attempt to derive the source code.
 * This software is provided "AS IS", without warranty of any kind, express or implied,
 * including but not limited to the warranties of merchantability, fitness for a
 * particular purpose, and noninfringement.
 *
 * Permission to use this software is granted only under a valid written license
 * agreement with the copyright holder.
 */


// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

require_once __DIR__ . '/core/class-wpbs.php';

if ( class_exists( 'WPBS' ) ) {
	$wpbs = WPBS::init( plugin_dir_path( __FILE__ ) );
}


add_action( 'admin_enqueue_scripts', function () {
	wp_enqueue_code_editor( [
		'type' => 'text/javascript'
	] );
	wp_enqueue_style( 'wp-codemirror' );
} );