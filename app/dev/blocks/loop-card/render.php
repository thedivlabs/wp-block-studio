<?php


$is_rest = function_exists( 'wp_is_rest_request' )
	? wp_is_rest_request()
	: ( defined( 'REST_REQUEST' ) && REST_REQUEST );


if ( ! empty( $block->context['wpbs/isLoop'] ) ) {

	if ( ! empty( $block->context['wpbs/termId'] ) ) {
		$term_link = get_term_link( $block->context['wpbs/termId'] );
		$content   = str_replace( '%%__TERM_LINK_URL__%%', $term_link, $content ?? '' );
	}

	if ( ! empty( $block->context['wpbs/postId'] ) ) {
		$content = str_replace( '%%__POST_LINK_URL__%%', get_permalink(), $content ?? '' );
	}

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
