<?php

if ( ! empty( $block->context['wpbs/termId'] ) ) {
	$term_link = get_term_link( $block->context['wpbs/termId'] );
	$content   = str_replace( '%%__TERM_LINK_URL__%%', $term_link, $content ?? '' );
}

if ( ! empty( $block->context['wpbs/postId'] ) ) {
	$content = str_replace( '%%__POST_LINK_URL__%%', get_permalink(), $content ?? '' );
}

echo $content ?? '';
