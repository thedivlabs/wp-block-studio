<?php

const TRANSIENT_PREFIX     = 'wpbs_media_gallery_';
const TRANSIENT_EXPIRATION = DAY_IN_SECONDS;

$card_block = WPBS::get_block_template( $block->context['wpbs/card'] ?? array_filter( $block->parsed_block['innerBlocks'] ?? [], function ( $inner_block ) {
	return $inner_block['blockName'] === 'wpbs/media-gallery-card';
} )[0] ?? false );

$interactive = $block->context['wpbs/interactive'] ?? true;

$page             = intval( $block->context['wpbs/page'] ?? 1 );
$gallery          = $block->context['wpbs/gallery'] ?? [];
$type             = $gallery['type'] ?? [];
$gallery_settings = $gallery['settings'] ?? [];
$grid_settings    = $gallery['grid'] ?? [];
$slider_settings  = $gallery['slider'] ?? [];

$is_slider    = $type == 'slider';
$transient_id = TRANSIENT_PREFIX . $gallery_settings['gallery_id'];
$media        = get_transient( $transient_id ) ?: [];
$page_size    = intval( $gallery_settings['page_size'] ?? 0 );
$total_pages  = ceil( count( $media ) / $page_size );
$is_last      = $page >= $total_pages;

if ( empty( $media ) ) {

	$fields = WPBS::clean_array( get_field( 'wpbs', $gallery_settings['gallery_id'] ) );

	if ( ! empty( $gallery_settings['video_first'] ) ) {
		$media = WPBS::clean_array( [ ...( $fields['video'] ?? [] ), ...( $fields['images'] ?? [] ) ] );
	} else {
		$media = WPBS::clean_array( [ ...( $fields['images'] ?? [] ), ...( $fields['video'] ?? [] ) ] );
	}

	if ( ! empty( $media ) ) {
		set_transient( $transient_id, $media, TRANSIENT_EXPIRATION );
	}

}

if ( ! empty( $page_size ) && ! empty( $media ) ) {

	$offset = ( $page - 1 ) * $page_size;
	$media  = array_slice( $media, $offset, $page_size, true );

}

$classes = [
	'wpbs-media-gallery-container loop-container',
	$is_slider ? 'swiper-wrapper' : 'w-full flex flex-wrap relative z-20',
	$attributes['uniqueId'] ?? null,
	! empty( $grid_settings['masonry'] ) ? 'masonry' : null,
];

$wrapper_attributes        = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( $classes ) )
] );


?>

    <div <?php echo $wrapper_attributes ?>>

		<?php foreach ( $media ?: [] as $k => $media ) {

			$block_template                      = $card_block;
			$block_template['attrs']['uniqueId'] = $card_block['attrs']['uniqueId'] ?? '';

			$new_block = new WP_Block( $block_template, array_filter( [
				'wpbs/index'    => $k,
				'wpbs/media'    => $media,
				'wpbs/settings' => $gallery_settings,
			] ) );

			$new_block->attributes['media'] = $media;

			echo $new_block->render();

		}

		if ( ! empty( $grid['masonry'] ) ) {
			echo '<span class="gutter-sizer" style="width: var(--row-gap, var(--column-gap, 0px))"></span>';
		} ?>


    </div>


<?php

if ( ! empty( $attributes['uniqueId'] ) ) {
	add_action( 'wp_footer', function () use ( $card_block, $attributes ) {
		echo '<script type="application/json" class="' . ( $attributes['uniqueId'] . '-args' ) . '">' . wp_json_encode( array_filter( [
				'card' => $card_block,
			] ) ) . '</script>';
	} );
}


WPBS_Blocks::render_block_styles( $attributes ?? false );