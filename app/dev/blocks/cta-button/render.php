<?php

WPBS_Grid::render_style( $attributes ?? false, $block ?? false, false );

$classes = implode( ' ', array_filter( [
] ) );

$url      = ! empty( $attributes['wpbs-loop'] ) ? get_the_permalink() : $attributes['wpbs-link']['url'] ?? '#';
$title    = $attributes['wpbs-link']['title'] ?? 'Learn More';
$target   = ! empty( $attributes['wpbs-link']['opensInNewTab'] ) ? '_blank' : '_self';
$is_popup = ! empty( $attributes['wpbs-popup'] );

$button_props = $is_popup ? implode( ' ', array_filter( [
	'data-wp-interactive="wpbs/cta-button"',
	'data-wp-on--click="actions.popup"',
	'data-wp-context="' . esc_attr( json_encode( [
		'id' => $attributes['wpbs-popup'] ?? false,
	] ) ) . '"'
] ) ) : false;

?>


<div <?php echo get_block_wrapper_attributes( array_filter( [
	'class' => $classes,
] ) ); ?>>

	<?php if ( ! $is_popup ){ ?>
    <a href="<?= $url ?>" class="wpbs-cta-button__link wp-element-button" target="<?= $target ?>">
		<?php } else { ?>
        <button type="button" class="wpbs-cta-button__link wp-element-button" <?= $button_props ?>>
			<?php } ?>

			<?php if ( ! empty( $attributes['wpbs-icon-only'] ) ) { ?>
                <span class="screen-reader-text"><?= $title ?></span>
			<?php } else { ?>
                <span><?= $title ?></span>
			<?php } ?>

			<?php if ( $is_popup ){ ?>
        </button>
		<?php } else { ?>
    </a>
<?php } ?>

</div>
