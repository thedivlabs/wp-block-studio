<?php

//$css = WPBS_Style::block_styles( $attributes ?? [], $block ?? false );

WPBS_Blocks::render_block_styles( $attributes ?? false );

$settings = $attributes['wpbs-figure'] ?? [];

//WPBS::console_log( $block ?? false );

if ( ! empty( $block ) && ( $settings['type'] ?? false ) == 'featured-image' && ( $featured_image_id = get_post_thumbnail_id() ) ) {

	$breakpoints = wp_get_global_settings()['custom']['breakpoints'] ?? [];

	$picture = '';

	$breakpoint = $settings['breakpoint'] ?? $breakpoints['normal'] ?? false;

	$class = implode( ' ', array_filter( [
		'wpbs-picture'
	] ) );

	$style = implode( '; ', array_filter( [
		'object-fit:inherit'
	] ) );

	$src_attr    = ! empty( $settings['eager'] ) ? 'src' : 'data-src';
	$srcset_attr = ! empty( $settings['eager'] ) ? 'srcset' : 'data-srcset';

	$src_large      = wp_get_attachment_image_src( $featured_image_id, $settings['resolution'] ?? 'large' )[0] ?? false;
	$src_large_webp = $src_large ? $src_large . '.webp' : false;

	$picture .= '<picture class="' . $class . '" style="' . $style . '">';

	if ( file_exists( ABSPATH . ltrim( str_replace( get_site_url(), '', $src_large_webp ?: '' ), '/' ) ) ) {
		$picture .= '<source type="image/webp" ' . $srcset_attr . '="' . $src_large_webp . '" />';
	}

	$picture .= '<source type="image/jpeg" ' . $srcset_attr . '="' . $src_large . '" />';

	$picture .= wp_get_attachment_image( $featured_image_id, $settings['resolution'] ?? 'large' );

	$picture .= '</picture>';

	$replacements = [
		'%%PERMALINK%%' => get_the_permalink(),
		'%%IMAGE%%'     => $picture,
	];

	echo strtr( $content ?? '', $replacements );

} else {
	echo $content ?? false;
}





/*
 *
 * "
<figure class="wp-block-wpbs-figure wpbs-figure flex items-center justify-center relative max-w-full max-h-full wpbs-figure-21" data-wp-interactive="wpbs" data-wp-init="callbacks.observe"><div class="wpbs-figure__media w-full h-full overflow-hidden rounded-inherit" style="object-fit:cover"><picture class="wpbs-picture" style="object-fit:inherit"><source data-srcset="https://wp-block-studio.local/wp-content/uploads/brandon-siu-608784-unsplash-1500x1001.jpg.webp" media="(min-width: 1304px)"/><source data-srcset="https://wp-block-studio.local/wp-content/uploads/brandon-siu-608784-unsplash-1500x1001.jpg" media="(min-width: 1304px)"/><source data-srcset="https://wp-block-studio.local/wp-content/uploads/brandon-siu-608784-unsplash-1500x1001.jpg.webp" media="(min-width: 32px)"/><source data-srcset="https://wp-block-studio.local/wp-content/uploads/brandon-siu-608784-unsplash-1500x1001.jpg" media="(min-width: 32px)"/><img data-src="https://wp-block-studio.local/wp-content/uploads/brandon-siu-608784-unsplash-1500x1001.jpg" alt="" loading="lazy"/></picture></div></figure>
"
 *
 * */

