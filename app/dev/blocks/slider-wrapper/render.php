<?php

WPBS_Blocks::render_block_styles( $attributes ?? false );

global $wp_query;

$settings       = WPBS::clean_array( $attributes['wpbs-slider'] ?? [] );
$query_settings = WPBS::clean_array( $attributes['wpbs-query'] ?? [] );
$is_loop        = str_contains( $attributes['className'] ?? '', 'is-style-loop' );
$is_current     = $is_loop && ( $query_settings['post_type'] ?? false ) === 'current';

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'               => implode( ' ', array_filter( [
		'wpbs-slider swiper overflow-hidden w-full relative !flex flex-col',
		! empty( $settings['collapse'] ) ? 'wpbs-slider--collapse' : null,
		! empty( $settings['fade-in'] ) ? 'wpbs-slider--fade-in' : null,
		$attributes['uniqueId'] ?? null
	] ) ),
	'data-wp-interactive' => 'wpbs/slider',
	'data-wp-init'        => 'callbacks.observeSlider',
	'data-wp-context'     => json_encode( [
		'args' => $settings['queryArgs'] ?? null
	] ),
] );

?>

<div <?php echo $wrapper_attributes ?>>
    <div class="wpbs-layout-grid__container relative z-20">

		<?php if ( $is_loop ) {
			echo $grid['content'] ?? false;
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

    </div>

	<?php if ( $show_button ) { ?>
        <button type="button"
                class="wpbs-layout-grid__button h-10 px-4 relative z-20 hidden"
                data-wp-on-async--click="actions.pagination">
			<?= $settings['pagination-label'] ?? 'View More' ?>
        </button>
	<?php } ?>

	<?php if ( $show_pagination ) {
		echo WPBS_Grid::pagination( $grid['query'] ?? false );
	} ?>

	<?php

	if ( ! empty( $block->inner_content ) ) {
		echo $block->inner_content[ array_key_last( $block->inner_content ) ];
	}

	if ( $is_loop ) {
		echo '<script class="wpbs-layout-grid-args" type="application/json">' . wp_json_encode( array_filter( [
				'card'        => WPBS::get_block_template( $block->inner_blocks[0]->parsed_block ?? [] ),
				'query'       => $query_settings,
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
				'page'        => $grid['page'] ?? 1,
				'max'         => $grid['max'] ?? null,
			] ) ) . '</script>';
	}

	?>

</div>







