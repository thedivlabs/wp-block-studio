<?php

WPBS_Blocks::render_block_styles( $attributes ?? false );

$replacements = [
	'%%URL%%' => ! empty( $attributes['wpbs-cta']['loop'] ) ? get_the_permalink() : esc_url( $attributes['wpbs-cta']['link']['url'] ?? '#' ),
];

echo strtr( $content ?? '', $replacements );
