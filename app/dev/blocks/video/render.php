<?php

$media        = $block->context['media'] ?? $attributes['wpbs-video'] ?? $attributes['media'] ?? false;
$settings     = $block->context['settings'] ?? false;
$is_lightbox  = ! empty( $media['lightbox'] );
$is_thumbnail = ! empty( $block->context['thumbnail'] );

$video_id = WPBS::youtube_image( $media['link'] ?? '', [
	'id_only' => true
] );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'         => implode( ' ', array_filter( [
		'wpbs-video',
		$is_thumbnail ? '--disabled h-full' : 'h-auto aspect-video',
		$is_lightbox ? '--lightbox' : null,
		'flex items-stretch relative w-full min-h-32 overflow-hidden cursor-pointer',
		$attributes['uniqueId'] ?? ''
	] ) ),
	'style'         => implode( '; ', array_filter( [
		! empty( $settings['overlay'] ) ? '--overlay:' . $settings['overlay'] : null
	] ) ),
	'data-title'    => $media['title'] ?? null,
	'data-vid'      => $video_id,
	'data-platform' => $media['platform'] ?? null,
] );

$media_class = implode( ' ', array_filter( [
	'wpbs-video__media w-full h-auto overflow-hidden relative hover:after:opacity-50',
	'after:content-[\'\'] after:block after:absolute after:top-0 after:left-0 after:w-full after:h-full after:z-10 after:pointer-events-none after:bg-black/50 after:opacity-100 after:transition-opacity after:duration-300 after:ease-in-out ',
] ) );

$button_class = implode( ' ', array_filter( [
	'wpbs-video__button pointer-events-none flex justify-center items-center absolute top-1/2 left-1/2 aspect-square z-20 transition-colors duration-300 leading-none text-white rounded-full opacity-50',
] ) );

$poster_class = 'w-full !h-full absolute top-0 left-0 z-0 object-cover object-center';

$poster_id = $media['poster']['id'] ?? $media['poster'] ?? false;

$is_eager = ! empty( $settings['eager'] );

add_filter( 'wpbs_preload_images', function ( $images ) use ( $is_eager, $poster_id, $settings ) {

	if ( ! $is_eager || ! $poster_id || ! empty( $images[ $poster_id ] ) ) {
		return $images;
	}

	$images[ $poster_id ] = [
		'id'         => $poster_id,
		'resolution' => $settings['resolution'] ?? 'small',
	];


	return $images;


} );

?>


<div <?php echo $wrapper_attributes ?>>


    <div class="<?= $media_class ?>">
        <button type="button" class="<?= $button_class ?>" style="font-size: clamp(62px, 5rem, 6vw)">
            <i class="fa-solid fa-circle-play"></i>
        </button>

		<?php

		if ( ! empty( $poster_id ) ) {
			echo wp_get_attachment_image( $poster_id, $settings['resolution'] ?? 'small', false, [
				'loading' => ! empty( $settings['eager'] ) ? 'eager' : 'lazy',
				'class'   => $poster_class,
			] );
		} else {
			echo WPBS::youtube_image( $media['link'] ?? '', [
				'class' => $poster_class
			] );
		}

		?>
    </div>
</div>
