<?php

WPBS_Blocks::render_block_styles( $attributes ?? false, '.wpbs-video__media:after {background: var(--overlay, rgba(0, 0, 0, .5));}' );

$imageId = $block->context['imageId'] ?? false;
$index   = $block->context['index'] ?? false;

if ( empty( $imageId ) ) {
	return false;
}

[ 'wpbs-video' => $settings ] = $attributes ?? [];

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-video flex items-center justify-center relative w-full h-auto aspect-video relative overflow-hidden cursor-pointer',
		! empty( $settings['modal'] ) ? 'wpbs-video--modal' : null,
		$attributes['uniqueId'] ?? ''
	] ) ),
	'style' => array_filter( [
		'--overlay' => $settings['overlay'] ?? null
	] )
] );

$media_class = implode( ' ', array_filter( [
	'wpbs-video__media w-full h-full overflow-hidden relative object-cover object-center hover:after:opacity-50 hover:[&_button]:opacity-90',
	'after:content-[""] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:z-10 after:pointer-events-none after:bg-black/50 after:opacity-100 after:transition-opacity after:duration-300 after:ease-in-out',
] ) );

$button_class = implode( ' ', array_filter( [
	'wpbs-video__button flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 aspect-square z-20 transition-colors duration-300 text-3xl leading-none text-white/50 rounded-full',
] ) );


$poster_class = 'w-full !h-full absolute top-0 left-0 z-0 object-cover';

$video_url = preg_replace( '/^\/+/', '', parse_url( $settings['share-link'] ?? '', PHP_URL_PATH ) ?: '' );

?>


<div <?php echo $wrapper_attributes ?>>
    <div class="<?= $media_class ?>">
        <button type="button" class="">
            <i class="fa-solid fa-circle-play"></i>
        </button>
    </div>
</div>
