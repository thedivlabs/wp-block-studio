<?php

if ( empty( $attributes['wpbs-media-gallery']['gallery_id'] ) ) {
	return false;
}

$settings      = $attributes['wpbs-media-gallery'] ?? [];
$grid_settings = $attributes['wpbs-grid'] ?? [];

$loop = WPBS_Media_Gallery::loop( $block->parsed_block['innerBlocks'][0] ?? false, $settings );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'               => implode( ' ', array_filter( [
		'wpbs-media-gallery',
		$attributes['uniqueId'] ?? null,
		! empty( $grid_settings['masonry'] ) ? '--masonry masonry' : null,
		! empty( $settings['lightbox'] ) ? '--lightbox' : null,
	] ) ),
	'data-wp-interactive' => 'wpbs/media-gallery',
	'data-wp-init'        => 'actions.init'
] );


?>

    <div <?php echo $wrapper_attributes ?>>
        <div class="wpbs-media-gallery__container wpbs-layout-wrapper loop-container">
			<?= $loop->content ?? $content ?? false; ?>

			<?php if ( ! empty( $grid_settings['masonry'] ) ) { ?>
                <span class="gutter-sizer" style="width: var(--row-gap, var(--column-gap, 0px))"></span>
			<?php } ?>
        </div>

        <button type="button"
                class="loop-button h-10 px-4 relative z-20 hidden"
                data-wp-on-async--click="actions.pagination">
			<?= $grid_settings['pagination-label'] ?? 'Show More' ?>
        </button>

		<?php

		echo WPBS_Media_Gallery::output_args( $loop, $block ?? false );

		?>
    </div>


<?php WPBS_Blocks::render_block_styles( $attributes ?? false );