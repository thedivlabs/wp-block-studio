<?php

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-layout-grid-card loop-card w-full block relative',
		$attributes['uniqueId'] ?? ''
	] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );

$is_link = ! empty( $attributes['wpbs-layout-grid-card']['linkPost']['enabled'] );
$link    = $is_link ? ( ! empty( $attributes['termId'] ) ? get_term_link( $attributes['termId'] ) : get_the_permalink() ) : false;
$target  = $is_link ? ( ! empty( $attributes['wpbs-layout-grid-card']['linkPost']['linkNewTab'] ) ? '_blank' : '_self' ) : false;
$rel     = $is_link && ( $attributes['wpbs-layout-grid-card']['linkPost']['linkRel'] ?? false );
$is_rest = ! empty( $block->attributes['is_rest'] );

$container_class = 'wpbs-layout-grid-card__container wpbs-layout-wrapper relative z-20';

?>


<div <?php echo $wrapper_attributes ?>>
    <div class="<?= esc_attr( $container_class ) ?>">
		<?php


		foreach ( $block->parsed_block['innerBlocks'] ?? [] as $inner_block ) {

			$inner_block_content = trim( render_block( $inner_block ) );

			if ( ! empty( $inner_block_content ) ) {
				echo $inner_block_content;
			} else {
				echo ( new WP_Block( $inner_block ) )->render();
			}


		}

		?>
    </div>

	<?php

	if ( $is_link ) {
		echo '<a class="absolute top-0 left-0 w-full h-full z-50" href="' . $link . '" target="' . $target . '" rel="' . $rel . '"><span class="screen-reader-text">' . ( $attributes['wpbs-layout-grid-card']['linkPost']['linkTitle'] ?? 'View Post' ) . '</span></a>';
	}

	echo $block->inner_content[ count( $block->inner_content ?? [] ) - 1 ] ?? '';

	?>


	<?php WPBS_Blocks::render_block_styles( $attributes ?? false, '', $is_rest ) ?>
</div>


