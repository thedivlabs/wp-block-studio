<?php

if ( ! empty( $attibutes['wpbs-loop'] ) ) {
	global $post;
	$content = str_replace( 'href="#"', get_the_permalink( $post ), $content ?? '' );
}

echo $content ?? false;