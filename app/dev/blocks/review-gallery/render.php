<?php

/*
 * {

        const blockProps = useBlockProps.save({
            className: blockClassnames(props.attributes),
            'data-wp-interactive': 'wpbs/review-gallery',
            'data-wp-init': 'actions.init',
            ...(props.attributes?.['wpbs-props'] ?? {})
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return <div {...innerBlocksProps} />;
    }
 *
 * */


$card_block = WPBS::get_block_template( array_values( array_filter( $block->parsed_block['innerBlocks'] ?? [], function ( $inner_block ) {
	return $inner_block['blockName'] === 'wpbs/review-card';
} ) )[0] ?? false );

$nav_block = array_values( array_filter( $block->parsed_block['innerBlocks'] ?? [], function ( $inner_block ) {
	return $inner_block['blockName'] === 'wpbs/slider-navigation';
} ) )[0] ?? false;

$company_id = $attributes['wpbs-review-gallery']['company_id'] ?? false;

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

$reviews = get_comments( array_filter( [
	'post_ID' => $company_id,
] ) ) ?? [];

?>

<div <?php echo $wrapper_attributes ?>>
    <div class="swiper-wrapper">
		<?php

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

		?>
    </div>

	<?php
	if ( $nav_block ) {
		echo ( new WP_Block( $nav_block ) )->render();
	}
	?>

</div>