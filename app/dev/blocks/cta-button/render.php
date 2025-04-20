<?php

WPBS_Grid::render_style( $attributes ?? false, $block ?? false, false );

$type = str_replace( 'is-style-', '', array_values( array_filter( explode( ' ', $attributes['className'] ?? '' ), function ( $class ) {
	return str_starts_with( $class, 'is-style' );
} ) )[0] ?? '' );

$classes = implode( ' ', array_filter( [
	'wpbs-cta-button--' . $type,
] ) );

$style = implode( '; ', array_filter( [
	'--icon'       => $attributes['wpbs-icon'] ?? null,
	'--icon-color' => $attributes['wpbs-icon-color'] ?? null,
] ) );

$url       = ! empty( $attributes['wpbs-loop'] ) ? get_the_permalink() : $attributes['wpbs-link']['url'] ?? '#';
$title     = $attributes['wpbs-link']['title'] ?? 'Learn More';
$target    = ! empty( $attributes['wpbs-link']['opensInNewTab'] ) ? '_blank' : '_self';
$is_button = ! empty( $attributes['wpbs-popup'] );
?>


<div <?php echo get_block_wrapper_attributes( [
	'class' => $classes,
	'style' => $style,
] ); ?>>

	<?php if ( $is_button ){ ?>
    <a href="<?= $url ?>" class="wpbs-cta-button__link wp-element-button" target="<?= $target ?>">
		<?php } else { ?>
        <button type="button" class="wpbs-cta-button__link wp-element-button">
			<?php } ?>

			<?php if ( ! empty( $attributes['wpbs-icon-only'] ) ) { ?>
                <span class="screen-reader-text"><?= $title ?></span>
			<?php } else { ?>
                <span><?= $title ?></span>
			<?php } ?>

			<?php if ( $is_button ){ ?>
        </button>
		<?php } else { ?>
    </a>
<?php } ?>

</div>
