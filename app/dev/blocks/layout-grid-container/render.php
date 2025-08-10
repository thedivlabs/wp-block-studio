<?php

global $wp_query;

$context = $block->attributes['context'] ?? $block->context ?? [];
$is_rest = ( $block->context ?? false ) == 'edit';

$card_block = $context['wpbs/card'] ?? array_filter( $block->parsed_block['innerBlocks'] ?? [], function ( $inner_block ) {
	return $inner_block['blockName'] === 'wpbs/layout-grid-card';
} )[0] ?? false;

$page           = intval( $context['wpbs/page'] ?? 1 );
$grid_settings  = WPBS::clean_array( array_merge( $context['wpbs/grid'] ?? [], $context['wpbs/settings'] ?? [] ) );
$query_settings = WPBS::clean_array( $context['wpbs/query'] ?? [] );
$is_loop        = ! empty( $grid_settings['loop'] );

$loop = ! $is_loop ? false : new WPBS_Loop( $card_block ?? false, $query_settings, $page, $is_rest );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-layout-grid-container loop-container w-full flex flex-wrap relative z-20 relative',
		( $loop->is_last ?? false ) ? '--last-page' : null,
		$attributes['uniqueId'] ?? null
	] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );


?>

<div <?php echo $wrapper_attributes ?>>
	<?php

	if ( $is_loop ) {
		echo $loop->content ?? false;
	} elseif ( ! empty( $block->parsed_block['innerBlocks'] ) ) {

		foreach ( $block->parsed_block['innerBlocks'] ?? [] as $parsed_block ) {
			echo render_block( $parsed_block );
		}

	} else {
		echo $content ?? false;
	} ?>

	<?php if ( ! empty( $settings['masonry'] ?? false ) ) { ?>
        <span class="gutter-sizer" style="width: var(--row-gap, var(--column-gap, 0px))"></span>
	<?php } ?>

</div>

<?php


if ( $is_loop && ! empty( $loop->query ) && ! empty( $loop->card ) ) {

	echo $loop->pagination( $loop->query );


}

echo '<script class="wpbs-args" type="application/json">' . wp_json_encode( array_filter( [
		'uniqueId' => $block->context['wpbs/settings']['uniqueId'] ?? false,
		'card'     => $loop->card,
		'query'    => $query_settings,
		'settings' => $grid_settings
	] ) ) . '</script>';
?>







