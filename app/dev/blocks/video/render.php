<?php

WPBS_Blocks::render_block_styles( $attributes ?? false, '.wpbs-video__media:after {background: var(--overlay, rgba(0, 0, 0, .5));}' );

$settings = $block->context['media'] ?? $attributes['wpbs-video'] ?? $attributes['media'] ?? false;

$video_id = WPBS::get_youtube_poster_image( $settings['link'] ?? '', [
	'id_only' => true
] );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'         => implode( ' ', array_filter( [
		'wpbs-video flex items-center justify-center relative w-full h-auto aspect-video overflow-hidden cursor-pointer',
		$attributes['uniqueId'] ?? ''
	] ) ),
	'style'         => implode( '; ', array_filter( [
		! empty( $settings['overlay'] ) ? '--overlay:' . $settings['overlay'] : null
	] ) ),
	'data-modal'    => ! empty( $settings['modal'] ),
	'data-title'    => $settings['title'] ?? null,
	'data-vid'      => $video_id,
	'data-platform' => $settings['platform'] ?? null,
] );

$media_class = implode( ' ', array_filter( [
	'wpbs-video__media w-full h-full overflow-hidden relative hover:after:opacity-50',
	'after:content-[\'\'] after:block after:absolute after:top-0 after:left-0 after:w-full after:h-full after:z-10 after:pointer-events-none after:bg-black/50 after:opacity-100 after:transition-opacity after:duration-300 after:ease-in-out ',
] ) );

$button_class = implode( ' ', array_filter( [
	'wpbs-video__button flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 aspect-square z-20 transition-colors duration-300 leading-none text-white rounded-full opacity-50',
] ) );

$poster_class = 'w-full !h-full absolute top-0 left-0 z-0 object-cover object-center';

$poster_id = $settings['poster']['id'] ?? $settings['poster'] ?? false;

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
				'class'   => $poster_class
			] );
		} else {
			echo WPBS::get_youtube_poster_image( $settings['link'] ?? '', [
				'class' => $poster_class
			] );
		}

		?>
    </div>
</div>
