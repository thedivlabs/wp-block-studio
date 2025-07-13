<?php

$media       = $block->context['media'] ?? false;
$index       = $block->context['index'] ?? 0;
$settings    = $block->context['settings'] ?? false;
$is_slider   = ! empty( $settings['is_slider'] );
$is_lightbox = ! empty( $settings['lightbox'] );

if ( empty( $media ) ) {
	return false;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'      => implode( ' ', array_filter( [
		'wpbs-media-gallery-card flex w-full h-max relative',
		$is_slider ? 'swiper-slide' : 'loop-card',
		$is_lightbox ? 'cursor-pointer wpbs-lightbox-card' : null,
		$attributes['uniqueId'] ?? ''
	] ) ),
	'data-index' => intval( $index ?? 0 ),
] );

?>


<div <?php echo $wrapper_attributes ?>>
	<?php

	if ( ! empty( $media['id'] ) || ! empty( $media['poster'] ) ) {
		echo wp_get_attachment_image( $media['poster'] ?? $media['id'], $settings['resolution'] ?? 'medium', false, [
			'loading' => ! empty( $settings['eager'] ) ? 'eager' : 'lazy',
			'class'   => 'w-full h-full object-cover flex overflow-hidden'
		] );
	} else {
		echo ( new WP_Block( [
			'blockName' => 'wpbs/video-element',
		], [
			'media'     => [
				'link'  => $media['link'] ?? '',
				'modal' => true
			],
			'thumbnail' => $is_lightbox,
		] ) )->render();

	}


	?>
</div>

<?php WPBS_Blocks::render_block_styles( $attributes ?? false ); ?>
