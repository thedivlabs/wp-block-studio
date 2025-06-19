<?php

WPBS_Blocks::render_block_styles( $attributes ?? false );

global $wp_query;

$settings       = WPBS::clean_array( $attributes['wpbs-grid'] ?? [] );
$query_settings = WPBS::clean_array( $attributes['wpbs-query'] ?? [] );
$is_current     = ( $query_settings['post_type'] ?? false ) === 'current';

$query = ! str_contains( $attributes['className'] ?? '', 'is-style-loop' ) ? false : match ( true ) {
	$is_current => $wp_query,
	default => WPBS_Grid::query( $attributes ?? [] )
};

$is_loop    = is_a( $query, 'WP_Query' );
$grid_cards = ! $is_loop ? false : WPBS_Grid::render( $attributes ?? false, $page = 1, $block->parsed_block['innerBlocks'][0] ?? false, $query );

if ( $is_loop && $is_current && ! empty( $query_settings['pagination'] ) && $query->max_num_pages > 1 ) {

	WPBS_Grid::output_pagination( $query );

}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'               => implode( ' ', array_filter( [
		'wpbs-layout-grid',
		$attributes['uniqueId'] ?? null
	] ) ),
	'data-wp-interactive' => 'wpbs/grid',
	'data-wp-init'        => 'actions.init',
	'data-wp-context'     => json_encode( WPBS::clean_array( [
		'uniqueId'    => $attributes['uniqueId'] ?? null,
		'divider'     => ! empty( $settings['divider'] ),
		'breakpoints' => [
			'small' => $settings['breakpoint-small'] ?? null,
			'large' => $settings['breakpoint-large'] ?? $attributes['wpbs-layout']['breakpoint'] ?? 'lg',
		],
		'columns'     => [
			'mobile' => $settings['columns-mobile'] ?? null,
			'small'  => $settings['columns-small'] ?? null,
			'large'  => $settings['columns-large'] ?? null,
		],
	] ) ),
] );

?>

<div <?php echo $wrapper_attributes ?>>
    <div class="wpbs-layout-grid__container relative z-20">

		<?php if ( $is_loop ) {
			echo $grid_cards['content'] ?? false;
		} elseif ( ! empty( $block->parsed_block['innerBlocks'] ) ) {

			foreach ( $block->parsed_block['innerBlocks'] ?? [] as $parsed_block ) {

				echo render_block( $parsed_block );
			}

		} else {
			echo $content ?? false;
		}
		?>

		<?php if ( ! empty( $settings['masonry'] ?? false ) ) { ?>
            <span class="gutter-sizer" style="width: var(--row-gap, var(--column-gap, 0px))"></span>
		<?php } ?>

		<?php if ( $is_loop && $query->max_num_pages > 1 ) { ?>
            <button type="button"
                    class="wpbs-layout-grid__button h-10 px-4 relative z-20 hidden"
                    data-wp-on-async--click="actions.pagination">
				<?= $settings['pagination-label'] ?? 'View More' ?>
            </button>
		<?php } ?>

		<?php if ( ! empty( $pagination ) ) {
			echo $pagination;
		} ?>

    </div>


	<?php

	if ( ! empty( $block->inner_content ) ) {
		echo $block->inner_content[ array_key_last( $block->inner_content ) ];
	}

	if ( $is_loop ) {
		echo '<script class="wpbs-layout-grid-args" type="application/json">' . wp_json_encode( array_filter( [
				'card'  => WPBS::get_block_template( $block->inner_blocks[0]->parsed_block ?? [] ),
				'query' => $query->query ?? false,
				'cur'   => ( $query->is_paged ?? false ) ?: 1,
				'max'   => $query->max_num_pages ?? 1,
				'attrs' => $query_settings,
			] ) ) . '</script>';
	}

	?>

</div>







