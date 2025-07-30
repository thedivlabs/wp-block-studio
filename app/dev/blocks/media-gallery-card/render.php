<?php

$media       = $block->context['wpbs/media'] ?? false;
$index       = $block->context['wpbs/index'] ?? 0;
$settings    = $block->context['wpbs/settings'] ?? false;
$gallery     = $settings['gallery'] ?? false;
$is_slider   = 'slider' == ( $settings['type'] ?? false );
$is_lightbox = ! empty( $gallery['lightbox'] );
$media_only  = ! empty( $block->context['wpbs/lightbox'] );
$is_eager    = ! empty( $gallery['eager'] );
$media_id    = $media['poster'] ?? $media ?? false;

if ( empty( $media_id ) ) {
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

add_filter( 'wpbs_preload_images', function ( $images ) use ( $is_eager, $media_id, $gallery ) {

	if ( ! $is_eager || ! $media_id || ! empty( $images[ $media_id ] ) ) {
		return $images;
	}

	return array_replace( [], $images, [
		$media_id => [
			'id'         => $media_id,
			'resolution' => $gallery['resolution'] ?? 'small',
		]
	] );

} );

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

		echo wp_get_attachment_image( $media_id, $gallery['resolution'] ?? 'small', false, [
			'loading' => $is_eager ? 'eager' : 'lazy',
			'class'   => 'w-full h-full object-cover flex overflow-hidden'
		] );
	}


	?>
</div>