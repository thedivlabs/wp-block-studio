<?php

WPBS_Grid::render_style( $attributes ?? false, $block ?? false, false );

$classes = implode( ' ', array_filter( [
] ) );

$style = implode( '; ', array_filter( [
	'--icon'       => $attributes['wpbs-icon'] ?? null,
	'--icon-color' => $attributes['wpbs-icon-color'] ?? null,
] ) );

$url      = ! empty( $attributes['wpbs-loop'] ) ? get_the_permalink() : $attributes['wpbs-link']['url'] ?? '#';
$title    = $attributes['wpbs-link']['title'] ?? 'Learn More';
$target   = ! empty( $attributes['wpbs-link']['opensInNewTab'] ) ? '_blank' : '_self';
$is_popup = ! empty( $attributes['wpbs-popup'] );
?>


<div <?php echo get_block_wrapper_attributes( array_filter( [
	'class'               => $classes,
	'style'               => $style,
	'data-popup'          => $attributes['wpbs-popup'] ?? null,
	'data-wp-interactive' => 'wpbs/cta-button',
	'data-wp-on--click'   => $is_popup ? 'popup' : null,
	'data-context'        => $is_popup ? [
		'id' => $attributes['wpbs-popup'] ?? false,
	] : null,
] ) ); ?>>

	<?php if ( ! $is_popup ){ ?>
    <a href="<?= $url ?>" class="wpbs-cta-button__link wp-element-button" target="<?= $target ?>">
		<?php } else { ?>
        <button type="button" class="wpbs-cta-button__link wp-element-button">
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
