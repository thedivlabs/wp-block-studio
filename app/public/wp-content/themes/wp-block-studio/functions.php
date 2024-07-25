<?php

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

add_theme_support( 'custom-spacing' );
add_theme_support( 'custom-units' );
add_theme_support( 'block-template-parts' );
add_theme_support( 'core-block-patterns' );
add_theme_support( 'custom-background' );
add_theme_support( 'editor-styles' );
add_theme_support( 'post-thumbnails' );
add_theme_support( 'appearance-tools' );
add_theme_support( 'wp-block-styles' );
add_theme_support( 'border' );
//add_theme_support( 'editor-color-palette' );
//add_theme_support( 'editor-gradient-presets' );


add_action( 'init', function () {

	register_block_type( get_stylesheet_directory() . '/blocks/content-section/' );

} );

function console_log( $var ): bool {
	return add_action( 'wp_footer', function () use ( $var ) {

		$var = json_encode( $var );

		echo "<script>console.log($var)</script>";

	} );
}

add_action( 'init', 'theme_assets' );
add_action( 'wp_enqueue_scripts', 'view_assets' );
//add_action( 'enqueue_block_editor_assets', 'admin_assets' );
add_action( 'enqueue_block_assets', 'admin_assets' );

function theme_assets(): void {
	wp_register_style( 'wpbs-theme', get_stylesheet_directory_uri() . '/dist/theme.min.css' );
	wp_register_style( 'wpbs-admin', get_stylesheet_directory_uri() . '/dist/admin.min.css' );

	foreach ( glob( get_stylesheet_directory() . '/dist/blocks/**', GLOB_ONLYDIR ) as $dir ) {
		if ( ! file_exists( $dir . '/block.min.css' ) ) {
			continue;
		}
		$name = basename( $dir );
		wp_register_style( join( '-', [
			'wpbs',
			$name
		] ), get_stylesheet_directory_uri() . '/dist/blocks/' . $name . '/block.min.css' );
	}
}

function admin_assets(): void {
	wp_enqueue_style( 'wpbs-theme' );
	wp_enqueue_style( 'wpbs-admin' );
}

function view_assets(): void {
	wp_enqueue_style( 'wpbs-theme' );
}