<?php


$card_block = array_filter( $block->parsed_block['innerBlocks'] ?? [], function ( $inner_block ) {
	return $inner_block['blockName'] === 'wpbs/media-gallery-card';
} )[0] ?? false;

$gallery = $block->context['wpbs/gallery'] ?? [];

WPBS::console_log( $gallery );

$settings  = $gallery['settings'] ?? false;
$is_slider = $settings['is_slider'] ?? false;
$grid      = $gallery['grid'] ?? false;

$loop = WPBS_Media_Gallery::loop( $card_block, $settings );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-media-gallery-container',
		$is_slider ? 'swiper-wrapper' : 'w-full flex flex-wrap loop-container relative z-20',
		$attributes['uniqueId'] ?? null,
		! empty( $grid['masonry'] ) ? '--masonry masonry' : null,
		! empty( $settings['lightbox'] ) ? '--lightbox' : null,
	] ) ),
] );


?>

    <div <?php echo $wrapper_attributes ?>>

		<?php if ( ! $is_slider ) { ?>
			<?= $loop->content ?? $content ?? false; ?>

			<?php if ( ! empty( $grid['masonry'] ) ) { ?>
                <span class="gutter-sizer" style="width: var(--row-gap, var(--column-gap, 0px))"></span>
			<?php } ?>

			<?php

			echo ( new WP_Block( [
				'blockName' => 'wpbs/loop-pagination-button',
			], [
				'label' => $settings['button_label'] ?? null
			] ) )->render();

			?>

		<?php } else {


			echo $loop->content ?? $content ?? false;

			if ( ! empty( $nav_block ) ) {
				echo render_block( $nav_block );
			}

		} ?>


    </div>


<?php WPBS_Blocks::render_block_styles( $attributes ?? false );