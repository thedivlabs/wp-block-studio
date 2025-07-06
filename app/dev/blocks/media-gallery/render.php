<?php

if ( empty( $attributes['wpbs-media-gallery']['gallery_id'] ) ) {
	return false;
}

$settings      = $attributes['wpbs-media-gallery'] ?? [];
$grid_settings = $attributes['wpbs-grid'] ?? [];

$is_slider = str_contains( ( $attributes['className'] ?? '' ), 'is-style-slider' );

$loop = WPBS_Media_Gallery::loop( $block->parsed_block['innerBlocks'][0] ?? false, $settings, 1, [
	'isSlider'   => $is_slider,
	'isLightbox' => ! empty( $settings['lightbox'] ),
] );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'               => implode( ' ', array_filter( [
		'wpbs-media-gallery h-max',
		$is_slider ? 'swiper' : null,
		$attributes['uniqueId'] ?? null,
		! empty( $grid_settings['masonry'] ) ? '--masonry masonry' : null,
		! empty( $settings['lightbox'] ) ? '--lightbox' : null,
	] ) ),
	'data-wp-interactive' => 'wpbs/media-gallery',
	'data-wp-init'        => 'actions.init',
	'data-wp-context'     => WPBS_Media_Gallery::output_args( $loop, $block ?? false ),
] );


?>

    <div <?php echo $wrapper_attributes ?>>

		<?php if ( ! $is_slider ) { ?>
            <div class="wpbs-media-gallery__container wpbs-layout-wrapper loop-container">
				<?= $loop->content ?? $content ?? false; ?>

				<?php if ( ! empty( $grid_settings['masonry'] ) ) { ?>
                    <span class="gutter-sizer" style="width: var(--row-gap, var(--column-gap, 0px))"></span>
				<?php } ?>
            </div>

			<?php

			echo ( new WP_Block( [
				'blockName' => 'wpbs/loop-pagination-button',
			], [
				'label' => $settings['button_label'] ?? null
			] ) )->render();

			?>

		<?php } else { ?>
            <div class="swiper-wrapper">
				<?= $loop->content ?? $content ?? false; ?>
            </div>
		<?php } ?>


    </div>


<?php WPBS_Blocks::render_block_styles( $attributes ?? false );