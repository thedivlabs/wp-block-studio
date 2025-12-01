<?php

$is_rest = function_exists( 'wp_is_rest_request' )
	? wp_is_rest_request()
	: ( defined( 'REST_REQUEST' ) && REST_REQUEST );


if (
	! empty( $attributes['isLoop'] ) &&
	! $is_rest
) {

	echo '<script type="application/json" data-wpbs-loop-template>';
	echo wp_json_encode(
		$block->parsed_block ?? [],
		JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
	);
	echo '</script>';

	return;
}

echo $content ?? '';
