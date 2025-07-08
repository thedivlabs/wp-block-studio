<?php

if ( empty( $attributes['wpbs-media-gallery']['gallery_id'] ) ) {
	return false;
}

$settings      = $attributes['wpbs-media-gallery'] ?? [];
$grid_settings = $attributes['wpbs-grid'] ?? [];

$is_slider = str_contains( ( $attributes['className'] ?? '' ), 'is-style-slider' );

$card_block = array_filter( $block->parsed_block['innerBlocks'] ?? [], function ( $inner_block ) {
	return $inner_block['blockName'] === 'wpbs/media-gallery-card';
} )[0] ?? false;

$loop = WPBS_Media_Gallery::loop( $card_block, $settings, 1, [
	'isSlider'   => $is_slider,
	'isLightbox' => ! empty( $settings['lightbox'] ),
] );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'               => implode( ' ', array_filter( [
		'wpbs-media-gallery h-max wpbs-slider',
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

		<?php } else {


			$nav_block = array_values( array_filter( $block->parsed_block['innerBlocks'] ?? [], function ( $inner_block ) {
				return $inner_block['blockName'] === 'wpbs/slider-navigation';
			} ) )[0] ?? false;

			WPBS::console_log( $block->parsed_block['innerBlocks'] ?? [] );

			?>
            <div class="swiper-wrapper">
				<?= $loop->content ?? $content ?? false; ?>
            </div>
			<?php

			if ( ! empty( $nav_block ) ) {
				echo render_block( $nav_block );
			}

		} ?>


    </div>


<?php WPBS_Blocks::render_block_styles( $attributes ?? false );