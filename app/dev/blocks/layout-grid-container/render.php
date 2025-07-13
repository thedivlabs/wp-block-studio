<?php

global $wp_query;

$grid_settings  = WPBS::clean_array( $block->context['wpbs/grid'] ?? [] );
$query_settings = WPBS::clean_array( $block->context['wpbs/query'] ?? [] );
$is_loop        = ! empty( $grid_settings['loop'] );

$loop = ! $is_loop ? false : new WPBS_Loop( $block ?? false, $query_settings );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-layout-grid-container loop-container w-full flex flex-wrap relative z-20 relative',
		$attributes['uniqueId'] ?? null
	] ) )
] );

?>

<div <?php echo $wrapper_attributes ?>>
	<?php if ( $is_loop ) {
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

if ( $is_loop ) {
	echo '<script class="wpbs-args" type="application/json">' . wp_json_encode( array_filter( [
			'card'     => $loop->card,
			'query'    => $loop->query->query ?? false,
			'uniqueId' => $attributes['uniqueId'] ?? null,
			...$grid_settings
		] ) ) . '</script>';
}


?>







