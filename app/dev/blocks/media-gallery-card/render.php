<?php

WPBS_Blocks::render_block_styles( $attributes ?? false );

$media       = $block->context['media'] ?? false;
$index       = $block->context['index'] ?? 0;
$is_slider   = $block->context['is_slider'] ?? false;
$gallery     = $block->context['gallery'] ?? false;
$is_lightbox = ! empty( $gallery['lightbox'] );

WPBS::console_log( $gallery );

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
		echo wp_get_attachment_image( $media['poster'] ?? $media['id'], $gallery['resolution'] ?? 'medium', false, [
			'loading' => ! empty( $gallery['eager'] ) ? 'eager' : 'lazy',
			'class'   => 'w-full h-full object-cover flex overflow-hidden'
		] );
	} else {
		echo ( new WP_Block( [
			'blockName' => 'wpbs/video-element',
		], [
			'media'    => [
				'link'  => $media['link'] ?? '',
				'modal' => true
			],
			'lightbox' => $is_lightbox,
		] ) )->render();

	}


	?>
</div>
