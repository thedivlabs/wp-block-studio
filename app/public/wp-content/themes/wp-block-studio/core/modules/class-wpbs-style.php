<?php

class WPBS_Style {

	private static WPBS_Style $instance;

	private function __construct() {


	}


	public static function block_styles( $attributes, $block ): void {

		if ( ! is_array( $attributes ) ) {
			return;
		}

		$selector = '.wp-block-' . str_replace( '/', '-', $block->block_type->name ?? false );

		if ( ! empty( $block->block_type->selectors['root'] ) ) {
			$selector = $selector . $block->block_type->selectors['root'];
		}

		$breakpoint = wp_get_global_settings()['custom']['breakpoints'][ $attributes['wpbs-layout-breakpoint'] ?? 'normal' ] ?? '';

		$attributes_color = array_filter( $attributes, function ( $v, $k ) {
			return in_array( $k, [
				'wpbs-layout-text-color-hover',
				'wpbs-layout-background-color-hover',
				'wpbs-layout-border-color-hover',
				'wpbs-layout-text-color-mobile',
				'wpbs-layout-background-color-mobile',
			] );
		}, ARRAY_FILTER_USE_BOTH );

		$attributes_background = array_filter( $attributes['wpbs-background'] ?? [], function ( $v, $k ) {

			$prop = WPBS::parse_prop( $k );

			return ! ( str_contains( $prop, 'mobile' ) || ! str_starts_with( $prop, 'wpbs' ) );

		}, ARRAY_FILTER_USE_BOTH );

		WPBS::console_log( $attributes_background );

		$attributes_layout = array_filter( $attributes, function ( $v, $k ) use ( $attributes_color ) {
			if (
				in_array( $k, array_merge( array_keys( $attributes_color ), [ 'wpbs-layout-container' ] ) ) ||
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
				in_array( $k, array_merge( array_keys( $attributes_layout ), [ 'wpbs-layout-breakpoint' ] ) ) ||
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

			if ( ! is_array( $value ) && ! in_array( $prop, [
					'wpbs-layout-breakpoint',
					'wpbs-layout-translate',
					'wpbs-layout-height-custom',
					'wpbs-layout-offset-header',
					'wpbs-layout-offset-header-mobile',
					'wpbs-layout-height'
				] ) ) {
				$prop = str_replace( 'wpbs-layout-', '', $prop );

				$css .= $prop . ':' . WPBS::parse_style( $value ) . ';';
			}

			$css .= match ( $prop ) {
				'wpbs-layout-translate' => 'transform:translate(' . join( ', ', [
						$value['left'] ?? '0px',
						$value['top'] ?? '0px'
					] ) . ');',
				'wpbs-layout-height' => 'height:' . ( $attributes_layout['wpbs-layout-height-custom'] ?? $value ) . ';',
				'wpbs-layout-height-custom' => empty( $attributes_layout['wpbs-layout-height'] ) ? 'height:' . $value . ';' : null,
				default => null
			};

		}

		if ( ! empty( $attributes_layouts['wpbs-layout-offset-header'] ) ) {

			$css .= 'padding-top:calc(var(--wpbs-header-height, 0px) + ' . WPBS::parse_style( $block->attributes['style']['spacing']['padding']['top'] ?? false ) . ') !important;';
		}


		$data = join( ' ', [ $selector, '{', $css, '}' ] );

		wp_add_inline_style( $block->block_type->style_handles[0] ?? false, $data );

		add_action( 'wp_enqueue_scripts', function () use ( $attributes_mobile, $attributes_color, $breakpoint, $selector, $attributes, $data ) {

			self::render_style_tag( $attributes_mobile, $attributes_color, $breakpoint, $selector, $attributes );

		}, 40 );

		add_action( 'admin_enqueue_scripts', function () use ( $attributes_mobile, $attributes_color, $breakpoint, $selector, $attributes, $data ) {

			self::render_style_tag( $attributes_mobile, $attributes_color, $breakpoint, $selector, $attributes );

		}, 40 );

	}

	public static function render_style_tag( $attributes_mobile, $attributes_color, $breakpoint, $selector, $attributes ): void {
		if ( empty( $attributes_mobile ) && empty( $attributes_color ) && empty( $attributes['wpbs-layout-opacity-hover'] ) ) {
			return;
		}

		echo '<style>';


		foreach ( $attributes_color ?? [] as $prop => $value ) {

			echo match ( $prop ) {
				'wpbs-layout-text-color-hover' => join( ' ', [
					$selector . ':hover',
					'{color: ' . $value . ' !important}'
				] ),
				'wpbs-layout-border-color-hover' => join( ' ', [
					$selector . ':hover',
					'{border-color: ' . $value . ' !important}'
				] ),
				'wpbs-layout-background-color-hover' => join( ' ', [
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
					'wpbs-layout-translate',
					'wpbs-layout-offset-header-mobile',
					'wpbs-layout-height-custom',
					'wpbs-layout-height',
					'wpbs-layout-translate-mobile',
					'wpbs-layout-height-mobile',
					'wpbs-layout-height-custom-mobile',
					'wpbs-layout-rounded',
					'wpbs-layout-padding-mobile',
					'wpbs-layout-margin-mobile',
				] ) ) {
				$prop = str_replace( [ 'wpbs-layout-', '-mobile' ], '', $prop );

				echo $prop . ':' . WPBS::parse_style( $value ) . ';';
			}

			echo match ( $prop ) {
				'wpbs-layout-translate-mobile' => 'transform:translate(' . join( ', ', [
						$value['left'] ?? '0px',
						$value['top'] ?? '0px'
					] ) . ');',
				'wpbs-layout-height-mobile' => 'height:' . ( $attributes_mobile['wpbs-layout-height-custom-mobile'] ?? $value ) . ';',
				'wpbs-layout-height-custom-mobile' => 'height:' . $value . ';',
				'wpbs-layout-rounded' => 'border-radius:' . join( ' ', [
						$value['top'] ?? '0px !important',
						$value['right'] ?? '0px !important',
						$value['bottom'] ?? '0px !important',
						$value['left'] ?? '0px !important',
					] ) . ';',
				'wpbs-layout-padding-mobile' => join( '; ', array_filter( [
					! empty( $value['top'] ) ? 'padding-top:' . ( ! empty( $attributes_mobile['wpbs-layout-offset-header-mobile'] ) ? 'calc(var(--wpbs-header-height, 0px) + ' . $value['top'] . ')' : $value['top'] ) . ' !important;' : null,
					! empty( $value['right'] ) ? 'padding-right:' . $value['right'] . ' !important;' : null,
					! empty( $value['bottom'] ) ? 'padding-bottom:' . $value['bottom'] . ' !important;' : null,
					! empty( $value['left'] ) ? 'padding-left:' . $value['left'] . ' !important;' : null,
				] ) ),
				'wpbs-layout-margin-mobile' => join( '; ', array_filter( [
					! empty( $value['top'] ) ? 'margin-top:' . $value['top'] . ' !important;' : null,
					! empty( $value['right'] ) ? 'margin-right:' . $value['right'] . ' !important;' : null,
					! empty( $value['bottom'] ) ? 'margin-bottom:' . $value['bottom'] . ' !important;' : null,
					! empty( $value['left'] ) ? 'margin-left:' . $value['left'] . ' !important;' : null,
				] ) ),
				'wpbs-layout-gap-mobile' => join( '; ', array_filter( [
					! empty( $value['top'] ) ? 'column-gap:' . $value['top'] . ' !important;' : null,
					! empty( $value['left'] ) ? 'row-gap:' . $value['left'] . ' !important;' : null,
				] ) ),
				default => null
			};

		}

		echo '}';

		foreach ( $attributes_color ?? [] as $prop => $value ) {

			echo match ( $prop ) {
				'wpbs-layout-text-color-mobile' => join( ' ', [ $selector, '{color: ' . $value . ' !important}' ] ),
				'wpbs-layout-background-color-mobile' => join( ' ', [
					$selector,
					'{background-color: ' . $value . ' !important}'
				] ),
				default => null
			};

		}


		echo '}';


		echo '</style>';
	}


	public static function init(): WPBS_Style {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Style();
		}

		return self::$instance;
	}

}


