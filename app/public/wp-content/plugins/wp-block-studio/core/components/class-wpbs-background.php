<?php

class WPBS_Background {

	private static WPBS_Background $instance;

	private function __construct() {

		add_filter( 'wpbs_loop_block', [ $this, 'set_block_data' ], 10, 3 );
		add_filter( 'wpbs_block_css', [ $this, 'parse_block_css' ], 10, 3 );

	}

	public function parse_block_css( $css, $attributes ): string {


		if ( ( $attributes['wpbs-background']['type'] ?? false ) == 'featured-image' ) {

			if ( is_tax() ) {
				$term = get_queried_object(); // Current term object

				if ( $term && isset( $term->term_id ) ) {
					$term_ref = "{$term->taxonomy}_{$term->term_id}";

					$img_id_large  = get_field( 'featured_image', $term_ref );
					$img_id_mobile = get_field( 'featured_image_mobile', $term_ref );
				}
			} else {
				$img_id_large  = get_post_thumbnail_id( get_the_ID() ) ?: ( $attributes['wpbs-background']['largeImage']['id'] ?? $attributes['wpbs-background']['mobileImage']['id'] ?? false );
				$img_id_mobile = get_field( 'page_settings_media_mobile_image', get_the_ID() ) ?: get_post_thumbnail_id( get_the_ID() ) ?: ( $attributes['wpbs-background']['mobileImage']['id'] ?? $attributes['wpbs-background']['largeImage']['id'] ?? false );
			}

			$img_src_large = wp_get_attachment_image_src( $img_id_large ?? false, $attributes['wpbs-background']['resolution'] ?? 'large' )[0] ?? '#';


			$img_src_mobile = wp_get_attachment_image_src( $img_id_mobile ?? false, $attributes['wpbs-background']['resolutionMobile'] ?? $attributes['wpbs-background']['resolution'] ?? 'large' )[0] ?? '#';

			$css = str_replace(
				[ '%POST_IMG_URL_LARGE%', '%POST_IMG_URL_MOBILE%' ],
				[
					'url(' . $img_src_large . ')',
					'url(' . $img_src_mobile . ')',
				],
				$css
			);

		}


		return $css;
	}

	public function set_block_data( $block, $original_id, $selector ): WP_Block {

		if ( ( $block->attributes['wpbs-background']['type'] ?? false ) == 'featured-image' ) {

			$img_id_large  = get_post_thumbnail_id( get_the_ID() ) ?: ( $block->attributes['wpbs-background']['largeImage']['id'] ?? $block->attributes['wpbs-background']['mobileImage']['id'] ?? false );
			$img_src_large = wp_get_attachment_image_src( $img_id_large, $block->attributes['wpbs-background']['resolution'] ?? 'large' )[0] ?? '#';

			$img_id_mobile  = get_post_thumbnail_id( get_the_ID() ) ?: ( $block->attributes['wpbs-background']['mobileImage']['id'] ?? $block->attributes['wpbs-background']['largeImage']['id'] ?? false );
			$img_src_mobile = wp_get_attachment_image_src( $img_id_mobile, $block->attributes['wpbs-background']['resolutionMobile'] ?? $block->attributes['wpbs-background']['resolution'] ?? 'large' )[0] ?? '#';

			$block->attributes['wpbs-css'] = str_replace(
				[ '.' . $original_id, '%POST_IMG_URL_LARGE%', '%POST_IMG_URL_MOBILE%' ],
				[
					$selector,
					'url(' . $img_src_large . ')',
					'url(' . $img_src_mobile . ')',
				],
				$block->attributes['wpbs-css']
			);

			return $block;

		}


		return $block;
	}


	public static function init(): WPBS_Background {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Background();
		}

		return self::$instance;
	}

}


