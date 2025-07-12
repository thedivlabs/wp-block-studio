<?php

WPBS_Blocks::render_block_styles( $attributes ?? false );

global $wp_query;

WPBS::console_log( $block ?? false );

return;

$settings = WPBS::clean_array( $attributes['wpbs-grid'] ?? [] );
$is_loop  = str_contains( $attributes['className'] ?? '', 'is-style-loop' );

$loop = ! $is_loop ? false : new WPBS_Loop( $block ?? false );

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
			...$settings
		] ) ) . '</script>';
}


?>







