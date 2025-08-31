<?php

$authors = get_users( [
	'who'                 => 'authors',
	'has_published_posts' => true,
] );

$current_author = is_author() ? get_queried_object_id() : false;

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
	$is_current   = $current_author == $author->ID;
	$item_classes = implode( ' ', array_filter( [
		'wpbs-authors-list__item',
		$is_current ? 'current-author' : null,
	] ) );
	echo '<li class="' . $item_classes . '"><a href="' . esc_url( get_author_posts_url( $author->ID ) ) . '" ' . ( $is_current ? 'aria-current="author"' : '' ) . '>' . esc_html( $author->display_name ) . '</a></li>';
}

echo '</ul>';
