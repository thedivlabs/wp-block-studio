<?php

global $wp_query;

$query_settings = WPBS::clean_array( $attributes['wpbs-query'] ?? [] );
$is_loop        = ! empty( $query_settings );
$is_current     = $is_loop && ( $query_settings['post_type'] ?? false ) === 'current';

$loop = ! $is_loop ? false : new WPBS_Loop( $block ?? false );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-slider-wrapper swiper-wrapper !flex !items-stretch grow min-w-full',
		$attributes['uniqueId'] ?? null
	] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );

?>

<div <?php echo $wrapper_attributes ?>>
	<?= $is_loop ? $loop->content ?? false : $content ?? false ?>
</div>







