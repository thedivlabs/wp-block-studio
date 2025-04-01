<?php

function wpbs_layout_grid_render( $block, $attributes, $content ): string|false {
	$block      = $block ?? false;
	$attributes = $attributes ?? false;
	$content    = $content ?? false;

	if ( empty( $attributes ) || empty( $block ) ) {
		WPBS::console_log( 'XXX' );


		return false;
	}

	//WPBS::console_log( $block );
	//WPBS::console_log( $attributes );
	//WPBS::console_log( [ $content ] );


	$css = WPBS_Style::block_styles( $attributes, $block );

	add_filter( 'wpbs_preload_images_responsive', function ( $images ) use ( $block ) {

		$block_images = array_map( function ( $image ) use ( $block ) {
			return array_merge( $image, [
				'breakpoint' => WPBS_Style::get_breakpoint( $block->attributes )
			] );
		}, $block->attributes['preload'] ?? [] );

		return array_merge( $images, $block_images );


	} );

	return '<div>QQQQQQPPPPPPAAAAAA</div>';
}


