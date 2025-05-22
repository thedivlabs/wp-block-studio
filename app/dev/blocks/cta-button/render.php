<?php

WPBS_Blocks::render_block_styles( $attributes ?? false );

$replacements = [
	'%%URL%%'   => !empty($attributes['wpbs-loop']) ? get_the_permalink() : esc_url( $attributes['wpbs-link']['url'] ?? '#' ),
];

echo strtr( $content ?? '', $replacements );
