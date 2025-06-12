<?php

WPBS_Blocks::render_block_styles( $attributes ?? false );

$settings = $attributes['wpbs-figure'] ?? [];

$is_featured_image = 'featured-image' === ( $settings['type'] ?? false );

$style = '';

if ( isset( $settings['blend'] ) && $settings['blend'] ) {
	$style .= 'mix-blend-mode:' . esc_attr( $settings['blend'] ) . ';';
}

if ( ! empty( $settings['contain'] ) ) {
	$style .= 'object-fit:contain;';
} else {
	$style .= 'object-fit:cover;';
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'               => implode( ' ', array_filter( [
		'wpbs-figure',
		$attributes['uniqueId'] ?? null
	] ) ),
	'style'               => trim( $style ),
	'data-wp-interactive' => 'wpbs',
	'data-wp-init'        => 'callbacks.observe',
] );

$breakpoint = ( wp_get_global_settings()['custom']['breakpoints'] ?? [] )[ $attributes['wpbs-breakpoint']['large'] ?? 'normal' ] ?? false;

$fallback_large_id  = ! empty( $settings['force'] ) ? $settings['imageLarge']['id'] ?? false : $settings['imageLarge'] ?? $settings['imageMobile'] ?? false;
$fallback_mobile_id = ! empty( $settings['force'] ) ? $settings['imageMobile']['id'] ?? false : $settings['imageMobile'] ?? $settings['imageLarge'] ?? false;

$src_attr    = ! empty( $settings['eager'] ) ? 'src' : 'data-src';
$srcset_attr = ! empty( $settings['eager'] ) ? 'srcset' : 'data-srcset';

$featured_image_id = $is_featured_image ? get_post_thumbnail_id() : 0;

$src_large      = wp_get_attachment_image_src( $featured_image_id ?: $fallback_large_id, $settings['resolutionLarge'] ?? 'large' )[0] ?? false;
$src_large_webp = $src_large ? $src_large . '.webp' : false;

$src_mobile      = wp_get_attachment_image_src( $featured_image_id ?: $fallback_mobile_id, $settings['resolutionMobile'] ?? $settings['resolutionLarge'] ?? 'large' )[0] ?? false;
$src_mobile_webp = $src_mobile ? $src_mobile . '.webp' : false;

?>

<figure <?php echo $wrapper_attributes ?>>

    <div class="wpbs-figure__media">
        <picture class="w-full h-full">
			<?php if ( ! empty( $src_large ) ) { ?>
                <source type="image/webp"
					<?php echo 'media="(min-width: ' . $breakpoint . ' )"' ?>
					<?php echo $srcset_attr . '="' . esc_attr( $src_large_webp ) . '"' ?>
                />
                <source type="image/jpeg"
					<?php echo 'media="(min-width: ' . $breakpoint . ' )"' ?>
					<?php echo $srcset_attr . '="' . esc_attr( $src_large ) . '"' ?>
                />
			<?php } ?>


			<?php if ( ! empty( $src_mobile ) ) { ?>
                <source type="image/webp"
					<?php echo 'media="(max-width: ' . $breakpoint . ' )"' ?>
					<?php echo $srcset_attr . '="' . esc_attr( $src_mobile_webp ) . '"' ?>
                />
                <source type="image/jpeg"
					<?php echo 'media="(max-width: ' . $breakpoint . ' )"' ?>
					<?php echo $srcset_attr . '="' . esc_attr( $src_mobile ) . '"' ?>
                />
			<?php } ?>

			<?php echo wp_get_attachment_image( $featured_image_id ?: $fallback_large_id, $settings['resolutionLarge'] ?? $settings['resolutionMobile'] ?? 'large', false, [
				'loading' => ! empty( $settings['eager'] ) ? 'eager' : 'lazy'
			] ) ?>
        </picture>
    </div>

</figure>
