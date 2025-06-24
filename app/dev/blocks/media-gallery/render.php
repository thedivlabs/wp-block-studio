<?php

if ( empty( $attributes['wpbs-media-gallery']['galleryId'] ) ) {
	return false;
}

$query_settings = $attributes['wpbs-media-gallery'] ?? [];
$grid_settings  = $attributes['wpbs-grid'] ?? [];

$loop = WPBS_Media_Gallery::loop( $block->parsed_block['innerBlocks'][0] ?? false, $query_settings );

WPBS::console_log( $query_settings );
WPBS::console_log( $loop );

return;


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
			<?= $query->content ?? $content ?? false ?>
        </div>


		<?php


		echo '<script class="wpbs-media-gallery-args" type="application/json">' . wp_json_encode( array_filter( [
				'card'        => $loop->card,
				'uniqueId'    => $attributes['uniqueId'] ?? null,
				'divider'     => ! empty( $grid_settings['divider'] ),
				'breakpoints' => [
					'small' => $grid_settings['breakpoint-small'] ?? null,
					'large' => $grid_settings['breakpoint-large'] ?? $attributes['wpbs-layout']['breakpoint'] ?? 'lg',
				],
				'columns'     => [
					'mobile' => $grid_settings['columns-mobile'] ?? null,
					'small'  => $grid_settings['columns-small'] ?? null,
					'large'  => $grid_settings['columns-large'] ?? null,
				],
				'is_last'     => $loop->is_last ?? true,
			] ) ) . '</script>';


		?>
    </div>


<?php WPBS_Blocks::render_block_styles( $attributes ?? false );