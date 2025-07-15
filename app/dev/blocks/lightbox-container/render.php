<?php

$media = $block->attributes['media'] ?? false;

?>

<div class="wpbs-lightbox-container swiper-wrapper">

	<?php

	foreach ( $media ?? [] as $k => $media_item ) {

		$is_video = ! empty( $media_item['link'] );

		echo '<div class="' . implode( ' ', array_filter( [
				'swiper-slide wpbs-lightbox-slide',
				$is_video ? '--video' : null,
			] ) ) . '">';

		if ( $is_video ) {
			echo ( new WP_Block( [
				'blockName' => 'wpbs/video-element',
			], [
				'media' => [
					'link'  => $media_item['link'],
					'modal' => false
				],
				//'lightbox' => true,
			] ) )->render();
		} else {
			echo wp_get_attachment_image( $media_item, 'large', false, [
				'loading' => 'eager',
				'class'   => 'w-full h-full object-cover flex overflow-hidden'
			] );
		}

		echo '</div>';

	}

	?>

</div>