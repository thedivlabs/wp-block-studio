<?php

const TRANSIENT_PREFIX     = 'wpbs_media_gallery_';
const TRANSIENT_EXPIRATION = DAY_IN_SECONDS;

$context = $block->attributes['context'] ?? $block->context ?? [];

$lightbox_settings = $context['wpbs/lightbox'] ?? [];

$card_block = WPBS::get_block_template( $lightbox_settings['template'] ?? $context['wpbs/card'] ?? array_filter( $block->parsed_block['innerBlocks'] ?? [], function ( $inner_block ) {
	return $inner_block['blockName'] === 'wpbs/media-gallery-card';
} )[0] ?? false );

$interactive = ( $context['wpbs/interactive'] ?? true ) != false;

$page             = intval( $context['wpbs/page'] ?? 1 );
$settings         = $context['wpbs/settings'] ?? [];
$type             = $settings['type'] ?? [];
$gallery_settings = ! empty( $lightbox_settings ) ? $lightbox_settings : $settings['gallery'] ?? [];
$grid_settings    = $settings['grid'] ?? [];
$slider_settings  = $settings['slider'] ?? [];

$gallery_id = $gallery_settings['gallery_id'];
$unique_id  = $lightbox_settings['uniqueId'] ?? $attributes['uniqueId'] ?? null;

if ( empty( $gallery_id ) || empty( $unique_id ) ) {
	return;
}

$is_slider    = $type == 'slider';
$transient_id = TRANSIENT_PREFIX . $gallery_id;
$media        = get_transient( $transient_id ) ?: [];
$page_size    = ! empty( $lightbox_settings ) ? false : intval( $gallery_settings['page_size'] ?? 0 );

if ( empty( $media ) ) {

	$fields = WPBS::clean_array( get_field( 'wpbs', $gallery_id ) );

	if ( ! empty( $gallery_settings['video_first'] ) ) {
		$media = WPBS::clean_array( [ ...( $fields['video'] ?? [] ), ...( $fields['images'] ?? [] ) ] );
	} else {
		$media = WPBS::clean_array( [ ...( $fields['images'] ?? [] ), ...( $fields['video'] ?? [] ) ] );
	}

	set_transient( $transient_id, $media, TRANSIENT_EXPIRATION );

}

$total_pages = ceil( count( $media ) / ( $page_size ?: 1 ) );
$is_last     = $page >= $total_pages;

if ( ! empty( $page_size ) && ! empty( $media ) ) {

	$offset = ( $page - 1 ) * $page_size;
	$media  = array_slice( $media, $offset, $page_size, true );

}

$classes = array_filter( [
	'wpbs-media-gallery-container loop-container',
	$is_slider ? 'swiper-wrapper' : 'w-full flex flex-wrap items-start relative z-20',
	$is_last ? '--last-page' : null,
	$unique_id,
	! empty( $grid_settings['masonry'] ) ? 'masonry' : null,
] );

$wrapper_attributes        = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( $classes ) )
] );

if ( ! empty( $lightbox_settings ) ) {
	WPBS_Media_Gallery::render_media( $media, $card_block, $settings, true );

	return;
}


?>

    <div <?php echo $wrapper_attributes ?>>

		<?php

		WPBS_Media_Gallery::render_media( $media, $card_block, $settings );

		if ( ! empty( $grid['masonry'] ) && empty( $lightbox_settings ) ) {
			echo '<span class="gutter-sizer" style="width: var(--row-gap, var(--column-gap, 0px))"></span>';
		}

		?>

    </div>


<?php

if ( ! empty( $unique_id ) && empty( $block->attributes['context'] ) && empty( $lightbox_settings ) ) {
	echo '<script type="application/json" class="wpbs-media-gallery-args">' . wp_json_encode( array_filter( [
			'card' => $card_block,
		] ) ) . '</script>';
}