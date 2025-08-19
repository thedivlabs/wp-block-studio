<?php


$card_block = WPBS::get_block_template( array_values( array_filter( $block->parsed_block['innerBlocks'] ?? [], function ( $inner_block ) {
	return $inner_block['blockName'] === 'wpbs/review-card';
} ) )[0] ?? false );

$nav_block = array_values( array_filter( $block->parsed_block['innerBlocks'] ?? [], function ( $inner_block ) {
	return $inner_block['blockName'] === 'wpbs/slider-navigation';
} ) )[0] ?? false;


$is_current = ( $attributes['wpbs-review-gallery']['company_id'] ?? false ) == 'current';
$company_id = $is_current ? get_the_ID() : $attributes['wpbs-review-gallery']['company_id'] ?? false;

if ( empty( $company_id ) ) {
	return;
}


$classes = array_filter( [
	'wpbs-review-gallery swiper wpbs-slider w-full wpbs-container',
	$attributes['uniqueId'] ?? null,
] );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'               => implode( ' ', array_filter( $classes ) ),
	...( $attributes['wpbs-props'] ?? [] ),
	'data-wp-interactive' => 'wpbs/review-gallery',
	'data-wp-init'        => 'actions.init',
	'data-wp-context'     => json_encode( array_filter( [
		'slider' => $attributes['wpbs-swiper-args'] ?? null,
	] ) ),


] );


$reviews = ! $is_current ? get_comments( array_filter( [
	'post_ID' => $company_id,
] ) ) ?? [] : new WP_Query( [
	'post_type'   => 'review',
	'post_status' => 'publish',
	'post__in'    => [ get_field( 'wpbs_reviews' ) ],
] );

?>

<div <?php echo $wrapper_attributes ?>>
    <div class="swiper-wrapper">
		<?php

		if ( ! $is_current ) {
			foreach ( $reviews as $k => $reviews_item ) {
				//WPBS::console_log( $reviews_item );
				$block_template                      = $card_block;
				$block_template['attrs']['uniqueId'] = $card_block['attrs']['uniqueId'] ?? '';
				$block_template['attrs']['review']   = $reviews_item;

				$new_block = new WP_Block( $block_template, array_filter( [
					'wpbs/review' => $reviews_item,
				] ) );

				echo $new_block->render();

			}
		} else {
			while ( $reviews->have_posts() ) {
				$reviews->the_post();
				global $post;
				$block_template                      = $card_block;
				$block_template['attrs']['uniqueId'] = $card_block['attrs']['uniqueId'] ?? '';
				$block_template['attrs']['review']   = $post;

				$new_block = new WP_Block( $block_template, array_filter( [
					'wpbs/review' => $post,
				] ) );

				echo $new_block->render();
			}
		}


		?>
    </div>

	<?php
	if ( $nav_block ) {
		echo ( new WP_Block( $nav_block ) )->render();
	}
	?>

</div>