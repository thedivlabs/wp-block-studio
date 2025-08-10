<?php

$transient_prefix     = 'wpbs_reviews_gallery_';
$transient_expiration = DAY_IN_SECONDS;

$context = $block->attributes['blockContext'] ?? $block->context ?? [];
$is_rest = ( $block->context ?? false ) == 'edit';

$card_block = WPBS::get_block_template( $context['wpbs/card'] ?? array_filter( $block->parsed_block['innerBlocks'] ?? [], function ( $inner_block ) {
	return $inner_block['blockName'] === 'wpbs/reviews-gallery-card';
} )[0] ?? false );

$page             = intval( $context['wpbs/page'] ?? 1 );
$settings         = $context['wpbs/settings'] ?? [];
$type             = $settings['type'] ?? false;
$gallery_settings = $settings['gallery'] ?? [];
$grid_settings    = $settings['grid'] ?? [];
$slider_settings  = $settings['slider'] ?? [];

$interactive = ( $context['wpbs/interactive'] ?? true ) != false;

$gallery_id = $gallery_settings['gallery_id'] ?? false;
$unique_id  = $attributes['uniqueId'] ?? null;

if ( empty( $gallery_id ) ) {
	return;
}

$is_slider    = $type == 'slider';
$transient_id = $transient_prefix . $gallery_id;
$reviews      = get_transient( $transient_id ) ?: [];
$page_size    = intval( $gallery_settings['page_size'] ?? 0 );

if ( empty( $reviews ) ) {

	$fields = WPBS::clean_array( get_field( 'wpbs', $gallery_id ) );

	if ( ! empty( $gallery_settings['video_first'] ) ) {
		$reviews = WPBS::clean_array( [ ...( $fields['video'] ?? [] ), ...( $fields['images'] ?? [] ) ] );
	} else {
		$reviews = WPBS::clean_array( [ ...( $fields['images'] ?? [] ), ...( $fields['video'] ?? [] ) ] );
	}

	set_transient( $transient_id, $reviews, $transient_expiration );

}

$total_pages = ceil( count( $reviews ) / ( $page_size ?: 1 ) );
$is_last     = $page >= $total_pages;

if ( $page_size > 0 && ! empty( $reviews ) ) {

	$offset        = ( $page - 1 ) * $page_size;
	$reviews_slice = array_slice( $reviews, $offset, $page_size, true );

}

$classes = array_filter( [
	'wpbs-reviews-gallery-container loop-container',
	$is_slider ? 'swiper-wrapper' : 'w-full flex flex-wrap items-start relative z-20',
	$is_last ? '--last-page' : null,
	$unique_id,
] );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( $classes ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );

?>

    <div <?php echo $wrapper_attributes ?>>

		<?php

		foreach ( $reviews_slice ?? $reviews as $k => $reviews_item ) {

			$block_template                      = $card_block;
			$block_template['attrs']['uniqueId'] = $card_block['attrs']['uniqueId'] ?? '';

			$new_block = new WP_Block( $block_template, array_filter( [
				'wpbs/index'    => $k,
				'wpbs/reviews'  => $reviews_item,
				'wpbs/settings' => $settings,
			] ) );

			echo $new_block->render();

		}

		if ( ! empty( $grid_settings['masonry'] ) && ! $is_rest ) {
			echo '<span class="gutter-sizer" style="width: var(--row-gap, var(--column-gap, 0px))"></span>';
		}

		?>

    </div>


<?php

if ( ! empty( $unique_id ) && ! $is_rest ) {
	echo '<script type="application/json" class="wpbs-reviews-gallery-args">' . wp_json_encode( array_filter( [
			'uniqueId' => $unique_id,
			'card'     => $card_block,
			'reviews'  => $reviews,
			'settings' => $settings,
		] ) ) . '</script>';
}