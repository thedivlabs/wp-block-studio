<?php

WPBS_Blocks::render_block_styles( $attributes ?? false );

global $wp_query;

$settings = WPBS::clean_array( $attributes['wpbs-grid'] ?? [] );
$is_loop  = str_contains( $attributes['className'] ?? '', 'is-style-loop' );

$loop = ! $is_loop ? false : new WPBS_Loop( $block ?? false );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'               => implode( ' ', array_filter( [
		'wpbs-layout-grid',
		$attributes['uniqueId'] ?? null
	] ) ),
	'data-wp-interactive' => 'wpbs/grid',
	'data-wp-init'        => 'actions.init',
] );

?>

<div <?php echo $wrapper_attributes ?>>
    <div class="wpbs-layout-grid__container loop-container relative z-20">

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

	echo $is_loop ? $loop->pagination( $loop->query ?? false ) : false;

	if ( $is_loop ) {
		echo '<script class="wpbs-args" type="application/json">' . wp_json_encode( array_filter( [
				'card'     => $loop->card,
				'query'    => $loop->query ?? false,
				'uniqueId' => $attributes['uniqueId'] ?? null,
				...$settings
			] ) ) . '</script>';
	}

	?>

</div>







