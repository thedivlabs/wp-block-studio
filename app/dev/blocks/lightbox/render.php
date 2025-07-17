<?php

$media = $block->attributes['media'] ?? false;

?>

<div class="wpbs-lightbox flex w-full h-screen overflow-hidden wpbs-lightbox--group">
    <div class="wpbs-lightbox__slider swiper">
        <div class="wpbs-lightbox__container swiper-wrapper">

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
						'media'    => [
							'link'  => $media_item['link'],
							'modal' => false
						],
						'lightbox' => true,
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
    </div>
    <nav class="wpbs-lightbox-nav wpbs-slider-nav">
        <button class="wpbs-lightbox-nav__button wpbs-lightbox-nav__button--prev">
            <i class="fa-light fa-arrow-left"></i>
        </button>
        <div class="wpbs-lightbox-nav__pagination swiper-pagination"></div>
        <button class="wpbs-lightbox-nav__button wpbs-lightbox-nav__button--next">
            <i class="fa-light fa-arrow-right"></i>
        </button>
    </nav>
</div>