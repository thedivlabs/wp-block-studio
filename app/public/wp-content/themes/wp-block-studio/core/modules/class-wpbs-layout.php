<?php

class WPBS_Layout {

	private static WPBS_Layout $instance;

	private function __construct() {


	}


	public static function layout_styles( $attributes, $block ): void {


		$selector = '.wp-block-' . str_replace( '/', '-', $block->block_type->name ?? false );

		if ( ! empty( $block->block_type->selectors['root'] ) ) {
			$selector = $selector . $block->block_type->selectors['root'];
		}

		$breakpoint = wp_get_global_settings()['custom']['breakpoints'][ $attributes['wpbs-breakpoint'] ?? 'normal' ] ?? '';

		$attributes_layout = array_filter( $attributes, function ( $v, $k ) {
			if ( in_array( $k, [
					'wpbs-container',
				] ) ) {
				return false;
			}

			return str_starts_with( $k, 'wpbs' ) && ( ! str_contains( $k, 'mobile' ) );
		}, ARRAY_FILTER_USE_BOTH );

		$attributes_mobile = array_filter( $attributes, function ( $v, $k ) {

			if ( in_array( $k, [
				'wpbs-translate-mobile',
				'wpbs-padding-mobile',
				'wpbs-margin-mobile',
				'wpbs-gap-mobile',
				'wpbs-height-mobile',
				'wpbs-height-custom-mobile',
				'wpbs-border-radius-mobile',
				'wpbs-breakpoint',
			] ) ) {
				return false;
			}

			return str_starts_with( $k, 'wpbs' ) && str_contains( $k, 'mobile' );
		}, ARRAY_FILTER_USE_BOTH );

		$css = '';

		foreach ( $attributes_layout as $prop => $value ) {

			if(empty($value)){
				continue;
			}

			if ( is_string( $value ) ) {
				$prop = str_replace( 'wpbs-', '', $prop );

				$css .= $prop . ':' . WPBS::parse_style( $value ) . ';';
			}

			$css .= match($prop){
				'wpbs-translate' => 'transform:translate('.join(', ', [$prop['left'] ?? '0px', $prop['top'] ?? '0px']).');',
				'wpbs-height' => 'height:' . ($attributes_layout['wpbs-height-custom'] ?? $prop) . ';',
				'wpbs-height-custom' => 'height:' . $prop . ';',
				default => null
			};

		}


		$data = join( ' ', [ $selector, '{', $css, '}' ] );

		wp_add_inline_style( $block->block_type->style_handles[0] ?? false, $data );

		add_action( 'wp_head', function () use ( $attributes_mobile, $breakpoint, $selector ) {

			if ( ! empty( $attributes_mobile ) ) {
				echo '<style>';
				echo '@media (max-width: calc(' . $breakpoint . ' - 1px)) { ';

				echo $selector . ' {';

				foreach ( $attributes_mobile as $prop => $value ) {

					$prop = str_replace( [ 'wpbs-', '-mobile' ], '', $prop );

					echo $prop . ':' . WPBS::parse_style( $value ) . ';';
				}

				echo '}';
				echo '}';
				echo '</style>';
			}

		}, 40 );

	}


	public static function init(): WPBS_Layout {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Layout();
		}

		return self::$instance;
	}

}


