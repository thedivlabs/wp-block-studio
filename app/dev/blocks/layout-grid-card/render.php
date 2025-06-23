<?php

WPBS_Blocks::render_block_styles( $attributes ?? false );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'               => implode( ' ', array_filter( [
		'wpbs-layout-grid-card loop-card w-full block relative',
		$attributes['uniqueId'] ?? ''
	] ) ),
	'data-index'          => intval( $block->context['index'] ?? null ),
	'data-wp-interactive' => 'wpbs/media-gallery-card',
	'data-wp-init'        => 'actions.init',
	'data-wp-context'     => json_encode( array_filter( [
		'index' => intval( $index ?? 0 ),
	] ) ),
] );

$is_link = ! empty( $attributes['wpbs-layout-grid-card']['linkPost'] );
$link    = $is_link ? ( ! empty( $attributes['termId'] ) ? get_term_link( $attributes['termId'] ) : get_the_permalink() ) : false;
$target  = $is_link ? ( ! empty( $attributes['wpbs-layout-grid-card']['linkNewTab'] ) ? '_blank' : '_self' ) : false;
$rel     = $is_link && ( $attributes['wpbs-layout-grid-card']['linkRel'] ?? false );

$container_class     = 'wpbs-layout-grid-card__container wpbs-layout-wrapper relative z-20';
$container_tag_open  = implode( ' ', array_filter( [
	$is_link ? '<a' : '<div',
	$is_link ? 'href="' . $link . '"' : null,
	$is_link ? 'target="' . $target . '"' : null,
	$is_link && $rel ? 'rel="' . $rel . '"' : null,
	'class="' . $container_class . '">',
] ) );
$container_tag_close = $is_link ? '</a>' : '</div>';

WPBS::console_log( $attributes['wpbs-css'] ?? false );

?>


<div <?php echo $wrapper_attributes ?>>

	<?php

	echo $container_tag_open;

	foreach ( ( $block->parsed_block['innerBlocks'] ?? [] ) as $inner_block ) {
		echo render_block( $inner_block );
	}

	echo $is_link ? '<span class="screen-reader-text">' . ( $attributes['wpbs-layout-grid-card']['linkTitle'] ?? 'View Post' ) . '</span>' : false;

	echo $container_tag_close;

	echo $block->inner_content[ count( $block->inner_content ?? [] ) - 1 ] ?? '';

	?>


</div>
