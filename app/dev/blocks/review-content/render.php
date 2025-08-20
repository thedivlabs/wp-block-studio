<?php

$comment = $block->context['wpbs/review'] ?? false;

if ( empty( $comment ) ) {
	return false;
}

$is_comment = is_a( $comment, 'WP_Comment' );
$is_post    = is_a( $comment, 'WP_Post' );

if ( $is_comment ) {
	$avatar = get_comment_meta( $comment->comment_ID ?? false, 'avatar', true );
	$rating = get_comment_meta( $comment->comment_ID ?? false, 'rating', true );
	$time   = get_comment_meta( $comment->comment_ID ?? false, 'timestamp', true );
} elseif ( $is_post ) {
	$avatar = wp_get_attachment_image_src( get_field( 'wpbs_media_featured_thumbnail', $comment->ID ), 'small' )[0] ?? '#';
	$time   = get_field( 'wpbs_details_date', $comment->ID );
	$rating = get_field( 'wpbs_review_rating', $comment->ID );
} else {
	return false;
}

$style = $attributes['wpbs-review-content']['type'] ?? false;

if ( ! empty( $attributes['wpbs-review-content']['line-clamp'] ) ) {

	$style_attribute = implode( '; ', [
		'line-clamp:' . $attributes['wpbs-review-content']['line-clamp'],
		'-webkit-line-clamp:' . $attributes['wpbs-review-content']['line-clamp'],
		'display:-webkit-box',
		'-webkit-box-orient:vertical',
		'overflow:hidden',
	] );
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'               => implode( ' ', array_filter( [
		'wpbs-review-content inline-block',
		! empty( $attributes['wpbs-review-content']['toggle'] ) ? '--toggle cursor-pointer' : null,
		$style == 'content' ? '--content' : null,
		$attributes['uniqueId'] ?? ''
	] ) ),
	'style'               => $style_attribute ?? null,
	'data-wp-interactive' => 'wpbs/review-content',
	'data-wp-init'        => 'actions.init',
	...( $attributes['wpbs-props'] ?? [] )
] );

if ( $is_comment ) {
	$review_content = match ( $style ) {
		'avatar' => '<img src="' . get_comment_meta( $comment->comment_ID ?? false, 'avatar', true ) . '" alt="" aria-hidden="true" width="100" height="100" class="w-full h-full object-cover" />',
		'rating' => get_comment_meta( $comment->comment_ID ?? false, 'rating', true ),
		'date' => date( 'Y-m-d H:i:s', get_comment_meta( $comment->comment_ID ?? false, 'timestamp', true ) ?: 0 ),
		'content' => $comment->comment_content ?? false,
		'name' => $comment->comment_author ?? false,
		default => false
	};
} elseif ( $is_post ) {
	$review_content = match ( $style ) {
		'name' => get_the_title( $comment->ID ),
		'job-title' => get_field( 'wpbs_details_job_title', $comment->ID ),
		'rating' => $rating,
		'date' => date( 'Y-m-d H:i:s', $time ?: 0 ),
		'content' => get_field( 'wpbs_review_full_review', $comment->ID ),
		'avatar' => '<img src="' . $avatar . '" alt="" aria-hidden="true" width="100" height="100" class="w-full h-full object-cover"  />',
		default => false
	};
} else {
	return false;
}


if ( ! $review_content ) {
	return false;
}
?>


<div <?php echo $wrapper_attributes ?>>
	<?php

	switch ( $style ) {
		case 'rating':
			for ( $i = 1; $i <= $review_content; $i ++ ) {
				//echo $attributes['wpbs-review-content']['icon'] ?? '<i class="fa-solid fa-star-sharp"></i>';
				echo '<i class="fa-solid fa-star-sharp"></i>';
			}
			break;
		default:
			echo $review_content;
	}


	?>
</div>


