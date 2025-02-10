<?php

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

require_once __DIR__ . '/core/class-wpbs.php';

if ( class_exists( 'WPBS' ) ) {
	$wpbs = WPBS::init();
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