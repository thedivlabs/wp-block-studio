<?php




if ( ! empty( $attributes['wpbs-loop'] ) ) {
	global $post;
	$content = str_replace( 'href="#"', 'href="' . get_the_permalink( $post ) . '"', $content ?? '' );

}

echo $content ?? false;
