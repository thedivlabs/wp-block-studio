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

add_action( 'wp_enqueue_scripts', 'theme_assets' );
add_action( 'enqueue_block_editor_assets', 'theme_assets' );

function theme_assets(): void {
	wp_register_style( 'wpbs-theme', get_stylesheet_directory_uri() . '/dist/theme.min.css' );
	wp_enqueue_style( 'wpbs-theme' );
}