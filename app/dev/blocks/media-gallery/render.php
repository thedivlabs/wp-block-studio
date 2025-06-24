<?php

WPBS_Blocks::render_block_styles( $attributes ?? false );

$gallery_id = $attributes['wpbs-media-gallery']['galleryId'] ?? false;

if ( empty( $gallery_id ) ) {
	return false;
}
$query = WPBS_Media_Gallery::loop( $block ?? false, $gallery_id );

$grid_settings = $attributes['wpbs-grid'] ?? [];

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
			'card'        => $query->card,
			'query'       => $query,
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
			'is_last'     => $query->is_last ?? true,
		] ) ) . '</script>';


	?>
</div>







