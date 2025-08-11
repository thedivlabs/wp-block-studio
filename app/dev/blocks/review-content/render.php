<?php

$comment = $block->context['wpbs/review'] ?? false;

if ( empty( $comment ) ) {
	return false;
}

$avatar = get_comment_meta( $comment->comment_ID ?? false, 'avatar', true );
$rating = get_comment_meta( $comment->comment_ID ?? false, 'rating', true );
$time   = get_comment_meta( $comment->comment_ID ?? false, 'timestamp', true );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-review-content inline-block',
		$attributes['uniqueId'] ?? ''
	] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );

$style = preg_match( '/is-style-([a-zA-Z0-9_-]+)/', $attributes['className'] ?? '', $m ) ? $m[1] : null;

$review_content = match ( $style ) {
	'avatar' => '<img src="' . get_comment_meta( $comment->comment_ID ?? false, 'avatar', true ) . '" alt="" aria-hidden="true" />',
	'rating' => get_comment_meta( $comment->comment_ID ?? false, 'rating', true ),
	'date' => date( 'Y-m-d H:i:s', get_comment_meta( $comment->comment_ID ?? false, 'timestamp', true ) ?: 0 ),
	'content' => $comment->comment_content ?? false,
	'name' => $comment->comment_author ?? false,
	default => false
};


if ( ! $review_content ) {
	return false;
}

?>


<div <?php echo $wrapper_attributes ?>>
	<?php

	switch ( $style ) {
		case 'rating':
			for ( $i = 1; $i <= $review_content; $i ++ ) {
				echo '<i class="fa-solid fa-star-sharp"></i>';
			}
			break;
		default:
			echo $review_content;
	}


	?>
</div>


