<?php

WPBS_Blocks::render_block_styles( $attributes ?? false );

$settings = $attributes['wpbs-figure'] ?? [];

$style = '';

if ( isset( $settings['blend'] ) && $settings['blend'] ) {
	$style .= 'mix-blend-mode:' . esc_attr( $settings['blend'] ) . ';';
}

if ( ! empty( $settings['contain'] ) ) {
	$style .= 'object-fit:contain;';
} else {
	$style .= 'object-fit:cover;';
}

// Merge styles into wrapper attributes
$wrapper_attributes = get_block_wrapper_attributes( [
	'style'               => $style,
	'data-wp-interactive' => 'wpbs',
	'data-wp-init'        => 'callbacks.observe',
] );

?>

    <figure <?= $wrapper_attributes ?>>


    </figure>

<?php

if ( ! empty( $block ) && ( $settings['type'] ?? false ) == 'featured-image' && ( $featured_image_id = get_post_thumbnail_id() ) ) {

	$breakpoints = wp_get_global_settings()['custom']['breakpoints'] ?? [];

	$picture = '';

	$breakpoint = $breakpoints[ $attributes['wpbs-breakpoint']['large'] ?? 'normal' ] ?? false;

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

