<?php

class WPBS_Background {

	private static WPBS_Background $instance;

	private function __construct() {

		add_filter( 'render_block_data', [ $this, 'filter_block_data' ], 10, 1 );


	}

	function filter_block_data( $block ): array {

		if ( ! empty( $block['attrs']['wpbs-background'] ) && ! empty( $block['attrs']['wpbs-css'] ) ) {

			if ( ( $block['attrs']['wpbs-background']['type'] ?? false ) == 'featured-image' ) {

				$img_id_large  = get_post_thumbnail_id( get_the_ID() ) ?: ( $block['attrs']['wpbs-background']['largeImage']['id'] ?? $block['attrs']['wpbs-background']['mobileImage']['id'] ?? false );
				$img_src_large = wp_get_attachment_image_src( $img_id_large, $block['attrs']['wpbs-background']['resolution'] ?? 'large' )[0] ?? '#';

				$img_id_mobile  = get_post_thumbnail_id( get_the_ID() ) ?: ( $block['attrs']['wpbs-background']['mobileImage']['id'] ?? $block['attrs']['wpbs-background']['largeImage']['id'] ?? false );
				$img_src_mobile = wp_get_attachment_image_src( $img_id_mobile, $block['attrs']['wpbs-background']['resolutionMobile'] ?? $block['attrs']['wpbs-background']['resolution'] ?? 'large' )[0] ?? '#';

				$block['attrs']['wpbs-css'] = str_replace(
					[ '%POST_IMG_URL_LARGE%', '%POST_IMG_URL_MOBILE%' ],
					[
						'url("' . $img_src_large . '")',
						'url("' . $img_src_mobile . '")',
					],
					$block['attrs']['wpbs-css']
				);

			}


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


