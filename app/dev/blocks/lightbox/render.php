<?php

$media = WPBS::clean_array( array_map( function ( $item ) {
	if ( is_array( $item ) ) {
		return [
			'link'        => isset( $item['link'] ) ? esc_url_raw( $item['link'] ) : null,
			'platform'    => isset( $item['platform'] ) ? sanitize_text_field( $item['platform'] ) : null,
			'title'       => isset( $item['title'] ) ? sanitize_text_field( $item['title'] ) : null,
			'description' => isset( $item['description'] ) ? sanitize_text_field( $item['description'] ) : null,
			'poster'      => isset( $item['poster'] ) && is_numeric( $item['poster'] ) ? absint( $item['poster'] ) : null,
		];
	}

	return is_numeric( $item ) ? absint( $item ) : null;
}, $block->attributes['media'] ?? [] ) );


?>

<div class="wpbs-lightbox flex w-full h-screen overflow-hidden wpbs-lightbox--group">
    <div class="wpbs-lightbox__slider wpbs-slider swiper">
        <div class="wpbs-lightbox__container swiper-wrapper">

			<?php

			foreach ( $media ?? [] as $k => $media_item ) {

				$is_video = ! empty( $media_item['link'] );

				echo '<div class="' . implode( ' ', array_filter( [
						'swiper-slide wpbs-lightbox-slide',
						$is_video ? '--video' : null,
					] ) ) . '">';

				echo '<div class="swiper-zoom-container">';

				if ( $is_video ) {
					echo ( new WP_Block( [
						'blockName' => 'wpbs/video-element',
					], [
						'media'    => [
							'poster' => $media_item['poster'] ?? false,
							'link'   => $media_item['link'] ?? false,
							'modal'  => false
						],
						'lightbox' => true,
						'settings' => $block->context['settings'] ?? false,
					] ) )->render();
				} else {
					echo wp_get_attachment_image( $media_item, 'large', false, [
						'loading' => 'eager',
						'class'   => 'w-full h-full object-cover flex overflow-hidden'
					] );
				}

				echo '</div>';
				echo '</div>';

			}

			?>

        </div>
        <div class="wpbs-lightbox-nav wpbs-slider-nav is-style-group">
            <button class="wpbs-lightbox-nav__button wpbs-lightbox-nav__button--prev wpbs-slider-nav__btn wpbs-slider-nav__btn--prev">
                <span class="screen-reader-text">Previous</span>
            </button>
            <div class="wpbs-lightbox-nav__pagination wpbs-slider-nav__pagination swiper-pagination"></div>
            <button class="wpbs-lightbox-nav__button wpbs-lightbox-nav__button--next wpbs-slider-nav__btn wpbs-slider-nav__btn--next">
                <span class="screen-reader-text">Next</span>
            </button>
        </div>
    </div>
</div>