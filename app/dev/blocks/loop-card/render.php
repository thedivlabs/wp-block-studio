<?php

if ( ! empty( $attributes['isLoop'] ) ) {

	echo '<script type="application/json" data-wpbs-loop-template>';
	echo wp_json_encode(
		$block->parsed_block ?? [],
		JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
	);
	echo '</script>';

	return;
}

echo $content ?? '';
