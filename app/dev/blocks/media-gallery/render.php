<?php

if ( empty( $attributes['wpbs-media-gallery']['gallery_id'] ) ) {
	return false;
}

$loop = WPBS_Media_Gallery::loop( $block->parsed_block['innerBlocks'][0] ?? false, $attributes['wpbs-media-gallery'] ?? [] );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'               => implode( ' ', array_filter( [
		'wpbs-media-gallery',
		$attributes['uniqueId'] ?? null
	] ) ),
	'data-wp-interactive' => 'wpbs/media-gallery',
	'data-wp-init'        => 'actions.init'
] );


?>

    <div <?php echo $wrapper_attributes ?>>
        <div class="wpbs-media-gallery__container wpbs-layout-wrapper loop-container">
			<?= $loop->content ?? $content ?? false ?>
        </div>


		<?php

		echo WPBS_Media_Gallery::output_args( $loop, $block ?? false );

		?>
    </div>


<?php WPBS_Blocks::render_block_styles( $attributes ?? false );