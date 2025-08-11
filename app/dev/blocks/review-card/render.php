<?php
echo 'REVIEW CARD';


$comment = $block->context['wpbs/review'] ?? false;

$avatar = get_comment_meta( $comment->comment_ID ?? false, 'avatar', true );
$rating = get_comment_meta( $comment->comment_ID ?? false, 'rating', true );
$time   = get_comment_meta( $comment->comment_ID ?? false, 'timestamp', true );

WPBS::console_log( $comment );
WPBS::console_log( $avatar );
WPBS::console_log( $rating );
WPBS::console_log( $time );


return;
$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-review-card loop-card w-full block relative',
		$attributes['uniqueId'] ?? ''
	] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );

$is_link = ! empty( $attributes['wpbs-review-card']['linkPost']['enabled'] );
$link    = $is_link ? ( ! empty( $attributes['termId'] ) ? get_term_link( $attributes['termId'] ) : get_the_permalink() ) : false;
$target  = $is_link ? ( ! empty( $attributes['wpbs-review-card']['linkPost']['linkNewTab'] ) ? '_blank' : '_self' ) : false;
$rel     = $is_link && ( $attributes['wpbs-review-card']['linkPost']['linkRel'] ?? false );
$is_rest = ! empty( $block->attributes['is_rest'] );


$container_class = 'wpbs-review-card__container wpbs-layout-wrapper relative z-20';

?>


<div <?php echo $wrapper_attributes ?>>
    <div class="<?= $container_class ?>">
		<?php foreach ( ( $block->parsed_block['innerBlocks'] ?? [] ) as $inner_block ) {
			echo render_block( $inner_block );
		} ?>
    </div>
	<?php

	if ( $is_link ) {
		echo '<a class="absolute top-0 left-0 w-full h-full z-50" href="' . $link . '" target="' . $target . '" rel="' . $rel . '"><span class="screen-reader-text">' . ( $attributes['wpbs-review-card']['linkPost']['linkTitle'] ?? 'View Post' ) . '</span></a>';
	}

	echo $block->inner_content[ count( $block->inner_content ?? [] ) - 1 ] ?? '';

	?>


	<?php WPBS_Blocks::render_block_styles( $attributes ?? false, '', $is_rest ) ?>
</div>


