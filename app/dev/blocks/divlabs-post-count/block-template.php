<?php

if ( is_singular() ) {
	return false;
}

global $wp_query;

$post_type_object = get_post_type_object( get_post_type() );

$result = false;

if ( $wp_query->post_count < 1 ) {
	$result = $post_type_object->labels->not_found ?? 'No results found';
}

if ( $wp_query->post_count > 1 ) {
	$result = implode( ' ', [
		'<span>Showing</span>',
		$wp_query->post_count,
		$post_type_object->labels->name ?? 'results',
	] );
}

if ( $wp_query->post_count == 1 ) {
	$result = implode( ' ', [
		'<span>Showing</span>',
		$wp_query->post_count,
		$post_type_object->labels->singular_name ?? 'result'
	] );
}

if ( ! $result ) {
	//return false;
}


?>


<small <?= DIVLABS::block_attributes( [
	'class' => 'divlabs-post-count block'
], $block ?? false ) ?>>

	<?php echo $result; ?>

</small>
