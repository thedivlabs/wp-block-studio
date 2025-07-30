<?php

$media       = $block->context['wpbs/media'] ?? false;
$index       = $block->context['wpbs/index'] ?? 0;
$settings    = $block->context['wpbs/settings'] ?? false;
$gallery     = $settings['gallery'] ?? false;
$is_slider   = 'slider' == ( $settings['type'] ?? false );
$is_lightbox = ! empty( $gallery['lightbox'] );
$media_only  = ! empty( $block->context['wpbs/lightbox'] );

if ( empty( $media ) ) {
	return false;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'      => implode( ' ', array_filter( [
		'wpbs-media-gallery-card flex w-full h-max relative loop-card',
		$is_slider ? 'swiper-slide' : 'loop-card',
		$is_lightbox ? 'cursor-pointer wpbs-lightbox-card' : null,
		$attributes['uniqueId'] ?? ''
	] ) ),
	'data-index' => $index,
] );

?>


<div <?php echo $media_only ? null : $wrapper_attributes ?>>
	<?php

	if ( ! empty( $media['link'] ) ) {
		echo ( new WP_Block( [
			'blockName' => 'wpbs/video-element',
		], [
			'media'     => $media,
			'thumbnail' => $is_lightbox,
			'settings'  => $gallery,
		] ) )->render();
	} else {

		echo wp_get_attachment_image( $media['poster'] ?? $media, $gallery['resolution'] ?? 'medium', false, [
			'loading' => ! empty( $gallery['eager'] ) ? 'eager' : 'lazy',
			'class'   => 'w-full h-full object-cover flex overflow-hidden'
		] );
	}


	?>
</div>