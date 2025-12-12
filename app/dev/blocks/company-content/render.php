<?php
declare( strict_types=1 );

$settings = $attributes['wpbs-company-content'] ?? [];

if ( empty( $settings['company-id'] ) || empty( $settings['type'] ) ) {
	return;
}

$post = get_post( (int) $settings['company-id'] );
if ( ! $post ) {
	return;
}

$acf = get_field( 'wpbs', $post->ID );
if ( empty( $acf ) ) {
	return;
}

$value = $acf[ $settings['type'] ] ?? '';

if ( empty( $value ) ) {
	return;
}

$label = $settings['label'] ?? '';

$block_props = get_block_wrapper_attributes();

?>
<div <?= $block_props ?>>
	<?php if ( $label ) : ?>
        <span class="wpbs-company-content__label">
            <?= esc_html( $label ); ?>
        </span>
	<?php endif; ?>

    <span class="wpbs-company-content__value">
        <?= wp_kses_post( $value ); ?>
    </span>
</div>
