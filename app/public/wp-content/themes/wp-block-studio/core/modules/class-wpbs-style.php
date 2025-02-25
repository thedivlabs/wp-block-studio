<?php

class WPBS_Style {

	private static WPBS_Style $instance;

	private function __construct() {


	}

	private static function get_selector( $block ): string {

		$selector = '.wp-block-' . str_replace( '/', '-', $block->block_type->name ?? '' );

		if ( ! empty( $block->block_type->selectors['root'] ) ) {
			$selector = $selector . $block->block_type->selectors['root'];
		}

		return $selector;
	}

	private static function get_breakpoint( $attributes ): string {

		return wp_get_global_settings()['custom']['breakpoints'][ $attributes['wpbs-layout-breakpoint'] ?? 'normal' ] ?? '';
	}


	public static function block_styles( $attributes, $block ): void {

		if ( ! is_array( $attributes ) ) {
			return;
		}

		$attributes = array_filter( $attributes, function ( $k ) {
			return str_starts_with( $k, 'wpbs' );
		}, ARRAY_FILTER_USE_KEY );

		$selector   = self::get_selector( $block );
		$breakpoint = self::get_breakpoint( $attributes );

		$layout_styles = self::layout_styles( $attributes, $block ); // css[]: prop => value

		WPBS::console_log( $layout_styles );

		//$data = join( ' ', [ $selector, '{', $css, '}' ] );

		/*wp_add_inline_style( $block->block_type->style_handles[0] ?? false, $data );

		add_action( 'wp_enqueue_scripts', function () use ( $css ) {

			self::render_style_tag( $css );

		}, 40 );

		add_action( 'admin_enqueue_scripts', function () use ( $attributes_mobile, $attributes_color, $breakpoint, $selector, $attributes, $data ) {

			self::render_style_tag( $attributes_mobile, $attributes_color, $breakpoint, $selector, $attributes );

		}, 40 );*/

	}

	private static function layout_styles( $attributes, $block ): array|false {

		if ( empty( $attributes ) ) {
			return false;
		}

		$special_attributes = array_filter( $attributes, function ( $k ) {
			return in_array( $k, [
				'wpbs-layout-container',
				'wpbs-layout-width',
				'wpbs-layout-width-custom',
				'wpbs-layout-height',
				'wpbs-layout-height-custom',
				'wpbs-layout-offset-header',
				'wpbs-layout-translate',
			] );
		}, ARRAY_FILTER_USE_KEY );

		$layout_attributes = array_filter( $attributes, function ( $k ) use ( $special_attributes, $attributes ) {

			return str_starts_with( $k, 'wpbs-layout' ) &&
			       ! is_array( $attributes[ $k ] ) &&
			       ! ( str_contains( $k, 'mobile' ) || str_contains( $k, 'hover' ) ) &&
			       ! in_array( $k, array_keys( $special_attributes ) );

		}, ARRAY_FILTER_USE_KEY );

		$styles = [];


		foreach ( $layout_attributes as $prop => $value ) {

			if ( empty( $value ) ) {
				continue;
			}

			$prop_name = str_replace( 'wpbs-layout-', '', $prop );

			$styles[ $prop_name ] = WPBS::parse_style( $value );

		}


		return $styles;

		/*$styles[ $prop_name ] = match ( $prop ) {
			'wpbs-layout-translate' => 'transform:translate(' . join( ', ', [
					$value['left'] ?? '0px',
					$value['top'] ?? '0px'
				] ) . ');',
			'wpbs-layout-height' => 'height:' . ( $attributes_layout['wpbs-layout-height-custom'] ?? $value ) . ';',
			'wpbs-layout-height-custom' => empty( $attributes_layout['wpbs-layout-height'] ) ? 'height:' . $value . ';' : null,
			default => null
		};


		if ( ! empty( $attributes_layouts['wpbs-layout-offset-header'] ) ) {

			$styles['desktop']['padding-top'] = 'padding-top:calc(var(--wpbs-header-height, 0px) + ' . WPBS::parse_style( $block->attributes['style']['spacing']['padding']['top'] ?? false ) . ') !important;';
		}

		foreach ( $attributes_color as $prop => $value ) {

			$styles['desktop'][ $prop ] = match ( $prop ) {
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

		return $styles;*/
	}

	public static function render_style_tag( $css ): void {

		if ( empty( $css ) || empty( $selector ) ) {
			return;
		}

		echo '<style>';

		echo $css;

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


