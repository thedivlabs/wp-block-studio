<?php

WPBS_Blocks::render_block_styles( $attributes ?? false );

$gallery_id = $attributes['wpbs-media-gallery']['galleryId'] ?? false;

if ( empty( $gallery_id ) ) {
	return false;
}
$query = WPBS_Media_Gallery::loop( $block ?? false, $gallery_id );

WPBS::console_log( $query );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-media-gallery',
		$attributes['uniqueId'] ?? null
	] ) )
] );


?>

<div <?php echo $wrapper_attributes ?>>
	<?= $query->content ?? $content ?? false ?>
</div>







