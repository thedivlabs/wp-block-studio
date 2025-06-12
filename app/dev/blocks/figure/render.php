<?php

WPBS_Blocks::render_block_styles( $attributes ?? false );

$settings = $attributes['wpbs-figure'] ?? [];

$is_featured_image = 'featured-image' === ( $settings['type'] ?? false );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'               => 'wpbs-figure',
	'style'               => get_style_attribute(),
	'data-wp-interactive' => 'wpbs',
	'data-wp-init'        => 'callbacks.observe',
] );

function get_style_attribute(): string {

	$style = '';

	if ( isset( $settings['blend'] ) && $settings['blend'] ) {
		$style .= 'mix-blend-mode:' . esc_attr( $settings['blend'] ) . ';';
	}

	if ( ! empty( $settings['contain'] ) ) {
		$style .= 'object-fit:contain;';
	} else {
		$style .= 'object-fit:cover;';
	}

	return trim( $style );
}

$breakpoint = ( wp_get_global_settings()['custom']['breakpoints'] ?? [] )[ $attributes['wpbs-breakpoint']['large'] ?? 'normal' ] ?? false;

$fallback_large_id  = ! empty( $settings['force'] ) ? $settings['imageLarge']['id'] ?? false : $settings['imageLarge'] ?? $settings['imageMobile'] ?? false;
$fallback_mobile_id = ! empty( $settings['force'] ) ? $settings['imageMobile']['id'] ?? false : $settings['imageMobile'] ?? $settings['imageLarge'] ?? false;

$src_attr    = ! empty( $settings['eager'] ) ? 'src' : 'data-src';
$srcset_attr = ! empty( $settings['eager'] ) ? 'srcset' : 'data-srcset';

$featured_image_id = $is_featured_image ? get_post_thumbnail_id() : false;

$src_large      = wp_get_attachment_image_src( $featured_image_id ?: $fallback_large_id, $settings['resolution'] ?? 'large' )[0] ?? false;
$src_large_webp = $src_large ? $src_large . '.webp' : false;

$src_mobile      = wp_get_attachment_image_src( $featured_image_id ?: $fallback_mobile_id, $settings['resolution'] ?? 'large' )[0] ?? false;
$src_mobile_webp = $src_large ? $src_large . '.webp' : false;

?>

    <figure <?= $wrapper_attributes ?>>

        <div class="wpbs-figure__media">

        </div>

    </figure>

<?php

if ( ! empty( $block ) && ( $settings['type'] ?? false ) == 'featured-image' && () ) {


	$picture .= '<picture class="wpbs-picture" >';

	$picture .= '<source type="image/webp" ' . $srcset_attr . '="' . $src_large_webp . '" />';

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

