<?php

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

require_once __DIR__ . '/core/modules/class-wpbs-blocks.php';

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


add_action( 'init', 'theme_assets' );
add_action( 'wp_enqueue_scripts', 'view_assets' );
add_action( 'enqueue_block_editor_assets', 'editor_assets' );
add_action( 'enqueue_block_assets', 'admin_assets' );

function theme_assets(): void {
	wp_register_style( 'wpbs-theme-css', get_stylesheet_directory_uri() . '/dist/theme.min.css' );
	wp_register_style( 'wpbs-admin-css', get_stylesheet_directory_uri() . '/dist/admin.min.css' );
	wp_register_script( 'wpbs-theme-js', get_stylesheet_directory_uri() . '/dist/theme.min.js' );

	foreach ( glob( get_stylesheet_directory() . '/dist/blocks/**', GLOB_ONLYDIR ) as $dir ) {
		if ( ! file_exists( $dir . '/block.css' ) ) {
			continue;
		}
		$name = basename( $dir );
		wp_register_style( join( '-', [
			'wpbs',
			$name
		] ), get_stylesheet_directory_uri() . '/dist/blocks/' . $name . '/block.css' );
	}
}

function admin_assets(): void {
	wp_enqueue_style( 'wpbs-theme-css' );
	wp_enqueue_style( 'wpbs-admin-css' );
}

function view_assets(): void {
	wp_enqueue_style( 'wpbs-theme-css' );
	wp_enqueue_script( 'wpbs-theme-js' );
}

function editor_assets(): void {
	add_editor_style();
}

add_filter( 'register_block_type_args', function ( $args, $block_type ) {


	if ( str_starts_with( $block_type, 'wpbs' ) ) {

		$args['render_callback'] = function ( $attributes, $content, $block ) {

			add_action( 'wp_head', function () use ( $attributes, $block ) {
				echo '<script>console.log(' . json_encode( $attributes ) . ')</script>';
				echo '<script>console.log(' . json_encode( $block ) . ')</script>';
			} );

			wp_add_inline_style( $block->block_type->style_handles[0] ?? false, '*{background: blue !important;}' );

			return $content;
		};
	}

	return $args;

}, 10, 3 );