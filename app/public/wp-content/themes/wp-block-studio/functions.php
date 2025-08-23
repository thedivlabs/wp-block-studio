<?php

function theme_styles(): void {
	wp_enqueue_style(
		'that-theme-style', // Handle for the stylesheet
		get_stylesheet_uri(), // Gets the URL to the theme's style.css
		array(), // Dependencies (optional)
		wp_get_theme()->get( 'Version' ) // Version (optional, uses theme version)
	);
}

add_action( 'wp_enqueue_scripts', 'theme_styles' );

