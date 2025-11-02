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

// -----------------------------------------------------------------------------
// Exit if accessed directly.
// -----------------------------------------------------------------------------
if ( ! defined( 'WPINC' ) ) {
	die;
}

// -----------------------------------------------------------------------------
// Load core class.
// -----------------------------------------------------------------------------
require_once __DIR__ . '/core/class-wpbs.php';

// -----------------------------------------------------------------------------
// Initialize only when ACF is loaded.
// -----------------------------------------------------------------------------
add_action( 'plugins_loaded', function () {

	// Bail early if ACF isn’t available.
	if ( ! function_exists( 'get_field' ) ) {

		// Add admin notice to inform user.
		add_action( 'admin_notices', function () {
			echo '<div class="notice notice-warning"><p><strong>WP Block Studio</strong> requires the Advanced Custom Fields (ACF) plugin to be installed and active. The plugin has been paused.</p></div>';
		} );

		return;
	}

	// Initialize plugin safely.
	if ( class_exists( 'WPBS' ) ) {
		WPBS::init( plugin_dir_path( __FILE__ ) );
	}
} );
