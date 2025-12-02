<?php

$is_rest = function_exists( 'wp_is_rest_request' )
	? wp_is_rest_request()
	: ( defined( 'REST_REQUEST' ) && REST_REQUEST );

$content = str_replace( '%%__POST_LINK_URL__%%', get_permalink(), $content ?? '' );
$content = str_replace( '%%__TERM_LINK_URL__%%', get_permalink(), $content ?? '' );

if ( ! empty( $attributes['isLoop'] ) ) {


	if ( ! $is_rest ) {
		echo '<script type="application/json" data-wpbs-loop-template>';
		echo wp_json_encode(
			$block->parsed_block ?? [],
			JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
		);
		echo '</script>';

		return;
	}
}

echo $content ?? '';
