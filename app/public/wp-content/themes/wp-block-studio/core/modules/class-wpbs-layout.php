<?php

class WPBS_Layout {

	private static WPBS_Layout $instance;

	private function __construct() {


	}


	public static function layout_styles( $attributes, $block ): void {

		if ( ! is_array( $attributes ) ) {
			return;
		}

		$selector = '.wp-block-' . str_replace( '/', '-', $block->block_type->name ?? false );

		if ( ! empty( $block->block_type->selectors['root'] ) ) {
			$selector = $selector . $block->block_type->selectors['root'];
		}

		$breakpoint = wp_get_global_settings()['custom']['breakpoints'][ $attributes['wpbs-breakpoint'] ?? 'normal' ] ?? '';

		$attributes_color = array_filter( $attributes, function ( $v, $k ) {
			return in_array( $k, [
				'wpbs-text-color-hover',
				'wpbs-background-color-hover',
				'wpbs-border-color-hover',
				'wpbs-text-color-mobile',
				'wpbs-background-color-mobile',
			] );
		}, ARRAY_FILTER_USE_BOTH );;

		$attributes_layout = array_filter( $attributes, function ( $v, $k ) use ( $attributes_color ) {
			if (
				in_array( $k, array_merge( array_keys( $attributes_color ), [ 'wpbs-container' ] ) ) ||
				str_contains( $k, 'mobile' ) ||
				! str_starts_with( $k, 'wpbs' )
			) {
				return false;
			} else {
				return true;
			}

		}, ARRAY_FILTER_USE_BOTH );


		$attributes_mobile = array_filter( $attributes, function ( $v, $k ) use ( $attributes_layout ) {

			if (
				in_array( $k, [ 'wpbs-breakpoint' ] ) ||
				in_array( $k, array_keys( $attributes_layout ) ) ||
				! str_starts_with( $k, 'wpbs' ) ||
				! str_contains( $k, 'mobile' )
			) {
				return false;
			} else {
				return true;
			}

		}, ARRAY_FILTER_USE_BOTH );

		$css = '';

		foreach ( $attributes_layout as $prop => $value ) {

			if ( empty( $value ) ) {
				continue;
			}

			if ( is_string( $value ) && ! in_array( $prop, [
					'wpbs-breakpoint',
					'wpbs-translate',
					'wpbs-height-custom',
					'wpbs-height'
				] ) ) {
				$prop = str_replace( 'wpbs-', '', $prop );

				$css .= $prop . ':' . WPBS::parse_style( $value ) . ';';
			}

			$css .= match ( $prop ) {
				'wpbs-translate' => 'transform:translate(' . join( ', ', [
						$value['left'] ?? '0px',
						$value['top'] ?? '0px'
					] ) . ');',
				'wpbs-height' => 'height:' . ( $attributes_layout['wpbs-height-custom'] ?? $value ) . ';',
				'wpbs-height-custom' => empty( $attributes_layout['wpbs-height'] ) ? 'height:' . $value . ';' : null,
				default => null
			};

		}


		$data = join( ' ', [ $selector, '{', $css, '}' ] );

		wp_add_inline_style( $block->block_type->style_handles[0] ?? false, $data );

		add_action( 'wp_head', function () use ( $attributes_mobile, $attributes_color, $breakpoint, $selector, $attributes ) {

			if ( empty( $attributes_mobile ) && empty( $attributes_color ) && empty( $attributes['wpbs-opacity-hover'] ) ) {
				return;
			}

			echo '<style>';
			
			if ( ! empty( $attributes['wpbs-opacity-hover'] ) ) {

				echo $selector . ':hover' . '{opacity: ' . $attributes['wpbs-opacity-hover'] . '}';
			}


			foreach ( $attributes_color ?? [] as $prop => $value ) {

				echo match ( $prop ) {
					'wpbs-text-color-hover' => join( ' ', [
						$selector . ':hover',
						'{color: ' . $value . ' !important}'
					] ),
					'wpbs-border-color-hover' => join( ' ', [
						$selector . ':hover',
						'{border-color: ' . $value . ' !important}'
					] ),
					'wpbs-background-color-hover' => join( ' ', [
						$selector . ':hover',
						'{background-color: ' . $value . ' !important}'
					] ),
					default => null
				};

			}

			echo '@media (max-width: calc(' . $breakpoint . ' - 1px)) { ';

			echo $selector . ' {';

			foreach ( $attributes_mobile ?? [] as $prop => $value ) {

				if ( is_string( $value ) && ! in_array( $prop, [
						'breakpoint',
						'wpbs-translate',
						'wpbs-height-custom',
						'wpbs-height',
						'wpbs-translate-mobile',
						'wpbs-height-mobile',
						'wpbs-height-custom-mobile',
						'wpbs-rounded',
						'wpbs-padding-mobile',
						'wpbs-margin-mobile',
					] ) ) {
					$prop = str_replace( [ 'wpbs-', '-mobile' ], '', $prop );

					echo $prop . ':' . WPBS::parse_style( $value ) . ';';
				}

				echo match ( $prop ) {
					'wpbs-translate-mobile' => 'transform:translate(' . join( ', ', [
							$value['left'] ?? '0px',
							$value['top'] ?? '0px'
						] ) . ');',
					'wpbs-height-mobile' => 'height:' . ( $attributes_mobile['wpbs-height-custom-mobile'] ?? $value ) . ';',
					'wpbs-height-custom-mobile' => 'height:' . $value . ';',
					'wpbs-rounded' => 'border-radius:' . join( ' ', [
							$value['top'] ?? '0px !important',
							$value['right'] ?? '0px !important',
							$value['bottom'] ?? '0px !important',
							$value['left'] ?? '0px !important',
						] ) . ';',
					'wpbs-padding-mobile' => join( '; ', array_filter( [
						! empty( $value['top'] ) ? 'padding-top:' . $value['top'] . ' !important;' : null,
						! empty( $value['right'] ) ? 'padding-right:' . $value['right'] . ' !important;' : null,
						! empty( $value['bottom'] ) ? 'padding-bottom:' . $value['bottom'] . ' !important;' : null,
						! empty( $value['left'] ) ? 'padding-left:' . $value['left'] . ' !important;' : null,
					] ) ),
					'wpbs-margin-mobile' => join( '; ', array_filter( [
						! empty( $value['top'] ) ? 'margin-top:' . $value['top'] . ' !important;' : null,
						! empty( $value['right'] ) ? 'margin-right:' . $value['right'] . ' !important;' : null,
						! empty( $value['bottom'] ) ? 'margin-bottom:' . $value['bottom'] . ' !important;' : null,
						! empty( $value['left'] ) ? 'margin-left:' . $value['left'] . ' !important;' : null,
					] ) ),
					'wpbs-gap-mobile' => join( '; ', array_filter( [
						! empty( $value['top'] ) ? 'column-gap:' . $value['top'] . ' !important;' : null,
						! empty( $value['left'] ) ? 'row-gap:' . $value['left'] . ' !important;' : null,
					] ) ),
					default => null
				};

			}

			echo '}';

			foreach ( $attributes_color ?? [] as $prop => $value ) {

				echo match ( $prop ) {
					'wpbs-text-color-mobile' => join( ' ', [ $selector, '{color: ' . $value . ' !important}' ] ),
					'wpbs-background-color-mobile' => join( ' ', [
						$selector,
						'{background-color: ' . $value . ' !important}'
					] ),
					default => null
				};

			}


			echo '}';


			echo '</style>';

		}, 40 );

	}


	public static function init(): WPBS_Layout {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Layout();
		}

		return self::$instance;
	}

}


