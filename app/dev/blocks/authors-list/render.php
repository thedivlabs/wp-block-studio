<?php

$authors = get_users( [
	'who'                 => 'authors',
	'has_published_posts' => true,
] );

if ( empty( $authors ) ) {
	return;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-authors-list',
	] ) )
] );


echo '<ul ' . $wrapper_attributes . '>';

foreach ( $authors as $author ) {
	echo '<li><a href="' . esc_url( get_author_posts_url( $author->ID ) ) . '">' . esc_html( $author->display_name ) . '</a></li>';
}

echo '</ul>';
