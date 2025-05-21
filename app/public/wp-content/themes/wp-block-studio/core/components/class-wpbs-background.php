<?php

class WPBS_Background {

	private static WPBS_Background $instance;

	private function __construct() {

		add_filter('wpbs_loop_block', [ $this, 'set_block_data' ], 10, 3);

	}

	public function set_block_data( $block, $unique_id, $original_id ): WP_Block {

		$new_id = join( ' ', array_filter( [
			$unique_id ?? null,
			$unique_id . '--' . get_the_ID()
		] ) );

		$selector = '.' . join( '.', array_filter( [
				$unique_id ?? null,
				$unique_id . '--' . get_the_ID()
			] ) );

		if ( ( $block->attributes['wpbs-background']['type'] ?? false ) == 'featured-image' ) {

			$img_id_large  = get_post_thumbnail_id( get_the_ID() ) ?: ( $block->attributes['wpbs-background']['largeImage']['id'] ?? $block->attributes['wpbs-background']['mobileImage']['id'] ?? false );
			$img_src_large = wp_get_attachment_image_src( $img_id_large, $block->attributes['wpbs-background']['resolution'] ?? 'large' )[0] ?? '#';

			$img_id_mobile  = get_post_thumbnail_id( get_the_ID() ) ?: ( $block->attributes['wpbs-background']['mobileImage']['id'] ?? $block->attributes['wpbs-background']['largeImage']['id'] ?? false );
			$img_src_mobile = wp_get_attachment_image_src( $img_id_mobile, $block->attributes['wpbs-background']['resolutionMobile'] ?? $block->attributes['wpbs-background']['resolution'] ?? 'large' )[0] ?? '#';

			$block->attributes['wpbs-css'] = str_replace(
				[ '.' . $unique_id, '%POST_IMG_URL_LARGE%', '%POST_IMG_URL_MOBILE%' ],
				[
					$selector,
					'url(' . $img_src_large . ')',
					'url(' . $img_src_mobile . ')',
				],
				$block->attributes['wpbs-css']
			);

			$block->attributes['uniqueId'] = $new_id;

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


