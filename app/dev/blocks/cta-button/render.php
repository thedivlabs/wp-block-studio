<?php

WPBS_Grid::render_style( $attributes ?? false, $block ?? false, false );

$replacements = [
	'%%URL%%'   => esc_url( $attributes['url'] ?? '#' ),
	'%%TARGET%%' => esc_attr( $attributes['target'] ?? '_self' ),
	'%%TITLE%%' => esc_html( $attributes['title'] ?? 'Click' ),
];

echo strtr( $content ?? '', $replacements );
