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
				'wpbs-breakpoint',
			] ) ) {
				return false;
			}

			return str_starts_with( $k, 'wpbs' ) && str_contains( $k, 'mobile' );
		}, ARRAY_FILTER_USE_BOTH );

		$css = '';

		foreach ( $attributes_layout as $prop => $value ) {

			if ( empty( $value ) ) {
				continue;
			}

			if ( is_string( $value ) ) {
				$prop = str_replace( 'wpbs-', '', $prop );

				$css .= $prop . ':' . WPBS::parse_style( $value ) . ';';
			}

			$css .= match ( $prop ) {
				'wpbs-translate' => 'transform:translate(' . join( ', ', [
						$value['left'] ?? '0px',
						$value['top'] ?? '0px'
					] ) . ');',
				'wpbs-height' => 'height:' . ( $attributes_layout['wpbs-height-custom'] ?? $value ) . ';',
				'wpbs-height-custom' => 'height:' . $value . ';',
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

					if ( is_string( $value ) ) {
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
								$value['top'] ?? '0px',
								$value['right'] ?? '0px',
								$value['bottom'] ?? '0px',
								$value['left'] ?? '0px',
							] ) . ';',
						'wpbs-padding-mobile' => join( '; ', array_filter( [
							! empty( $value['top'] ) ? 'padding-top:' . $value['top'] . ';' : null,
							! empty( $value['right'] ) ? 'padding-right:' . $value['right'] . ';' : null,
							! empty( $value['bottom'] ) ? 'padding-bottom:' . $value['bottom'] . ';' : null,
							! empty( $value['left'] ) ? 'padding-left:' . $value['left'] . ';' : null,
						] ) ),
						'wpbs-margin-mobile' => join( '; ', array_filter( [
							! empty( $value['top'] ) ? 'margin-top:' . $value['top'] . ';' : null,
							! empty( $value['right'] ) ? 'margin-right:' . $value['right'] . ';' : null,
							! empty( $value['bottom'] ) ? 'margin-bottom:' . $value['bottom'] . ';' : null,
							! empty( $value['left'] ) ? 'margin-left:' . $value['left'] . ';' : null,
						] ) ),
						'wpbs-gap-mobile' => join( '; ', array_filter( [
							! empty( $value['top'] ) ? 'column-gap:' . $value['top'] . ';' : null,
							! empty( $value['left'] ) ? 'row-gap:' . $value['left'] . ';' : null,
						] ) ),
						default => null
					};

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


