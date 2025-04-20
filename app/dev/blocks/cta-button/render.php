<?php

WPBS_Grid::render_style( $attributes ?? false, $block ?? false, false );

$replacements = [
	'%%URL%%'   => !empty($attributes['wpbs-loop']) ? get_the_permalink() : esc_url( $attributes['wpbs-link']['url'] ?? '#' ),
];

echo strtr( $content ?? '', $replacements );
