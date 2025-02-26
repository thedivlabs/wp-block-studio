<?php

class WPBS_Style {

	private static WPBS_Style $instance;

	private function __construct() {

		
		add_action( 'rest_api_init', function () {
			register_rest_route( 'wpbs/v1', "/layout-styles/",
				[
					'methods'             => 'POST',
					'permission_callback' => '__return_true',
					'accept_json'         => true,
					'callback'            => [ $this, 'render_layout_styles' ]
				]
			);
		} );

	}

	public function render_layout_styles( WP_REST_Request $request ): string|false {

		return WPBS_Style::block_styles( $request['attributes'] ?? false, $request['selector'] ?? false );

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


	public static function block_styles( $attributes, $block ): string|false {

		if ( ! is_array( $attributes ) ) {
			return false;
		}

		$selector   = is_string( $block ) ? $block : self::get_selector( $block );
		$breakpoint = self::get_breakpoint( $attributes );

		$styles = [
			'layout' => self::layout_styles( $attributes ),
			'mobile' => self::mobile_styles( $attributes ),
			'hover'  => self::hover_styles( $attributes ),
		];

		return self::render_styles( $styles, $selector, is_string( $block ) ? false : $block, $breakpoint );

	}

	private static function layout_styles( $attributes ): array|false {

		if ( empty( $attributes ) ) {
			return false;
		}

		$style_attributes = array_filter( [
			'column-gap' => $attributes['style']['spacing']['blockGap']['top'] ?? null,
			'row-gap'    => $attributes['style']['spacing']['blockGap']['left'] ?? null,
		] );

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
			       ! in_array( $k, array_merge( array_keys( $special_attributes ), [ 'wpbs-layout-breakpoint' ] ) );

		}, ARRAY_FILTER_USE_KEY );

		$styles = [];

		foreach ( $style_attributes as $prop => $value ) {

			if ( empty( $value ) ) {
				continue;
			}

			$styles[ $prop ] = $value;

		}

		foreach ( $layout_attributes as $prop => $value ) {

			if ( empty( $value ) ) {
				continue;
			}

			$prop_name = str_replace( 'wpbs-layout-', '', $prop );

			$styles[ $prop_name ] = $value;

		}

		foreach ( $special_attributes as $prop => $value ) {

			if ( empty( $value ) ) {
				continue;
			}

			switch ( $prop ) {
				case 'wpbs-layout-height':
				case 'wpbs-layout-height-custom':
					$styles['height'] = $attributes['wpbs-layout-height-custom'] ?? $attributes['wpbs-layout-height'] ?? null;
					break;
				case 'wpbs-layout-width':
				case 'wpbs-layout-width-custom':
					$styles['width'] = $attributes['wpbs-layout-width-custom'] ?? $attributes['wpbs-layout-width'] ?? null;
					break;
				case 'wpbs-layout-translate':
					$styles['transform'] = 'translate(' . join( ', ', [
							WPBS::parse_style( $attributes['wpbs-layout-translate']['top'] ?? '0px' ),
							WPBS::parse_style( $attributes['wpbs-layout-translate']['left'] ?? '0px' )
						] ) . ')';
					break;
				case 'wpbs-layout-offset-header':
					$styles['padding-top'] = 'calc(' . join( ' + ', [
							WPBS::parse_style( $attributes['style']['spacing']['padding']['top'] ?? '0px' ),
							'var(--wpbs-header-height, 0px)'
						] ) . ')';
					break;
			}

		}


		return $styles;

	}

	private static function hover_styles( $attributes ): array|false {

		if ( empty( $attributes ) ) {
			return false;
		}

		$hover_attributes = array_filter( $attributes, function ( $k ) use ( $attributes ) {

			return str_starts_with( $k, 'wpbs-layout' ) &&
			       str_contains( $k, 'hover' ) &&
			       ! is_array( $attributes[ $k ] ) &&
			       ! str_contains( $k, 'mobile' );

		}, ARRAY_FILTER_USE_KEY );

		$styles = [];

		foreach ( $hover_attributes as $prop => $value ) {

			if ( empty( $value ) ) {
				continue;
			}

			$prop_name = str_replace( [ 'wpbs-layout-', '-hover' ], '', $prop );

			$prop_name = match ( $prop_name ) {
				'text-color' => 'color',
				default => $prop_name
			};

			$styles[ $prop_name ] = $value;

		}

		return $styles;
	}

	private static function mobile_styles( $attributes ): array|false {

		if ( empty( $attributes ) ) {
			return false;
		}

		$special_attributes = array_filter( $attributes, function ( $k ) {
			return in_array( $k, [
				'wpbs-layout-width-mobile',
				'wpbs-layout-width-custom-mobile',
				'wpbs-layout-height-mobile',
				'wpbs-layout-height-custom-mobile',
				'wpbs-layout-translate-mobile',
			] );
		}, ARRAY_FILTER_USE_KEY );

		$mobile_attributes = array_filter( $attributes, function ( $k ) use ( $special_attributes, $attributes ) {

			return str_starts_with( $k, 'wpbs-layout' ) &&
			       str_contains( $k, 'mobile' ) &&
			       ! is_array( $attributes[ $k ] ) &&
			       ! str_contains( $k, 'hover' ) &&
			       ! in_array( $k, array_merge( array_keys( $special_attributes ), [ 'wpbs-layout-breakpoint' ] ) );

		}, ARRAY_FILTER_USE_KEY );

		$styles = [];

		foreach ( $mobile_attributes as $prop => $value ) {

			if ( empty( $value ) ) {
				continue;
			}

			$prop_name = str_replace( [ 'wpbs-layout-', '-mobile' ], '', $prop );

			$prop_name = match ( $prop_name ) {
				'text-color' => 'color',
				default => $prop_name
			};

			$styles[ $prop_name ] = $value;

		}

		foreach ( $special_attributes as $prop => $value ) {

			if ( empty( $value ) ) {
				continue;
			}

			switch ( $prop ) {
				case 'wpbs-layout-height-mobile':
				case 'wpbs-layout-height-custom-mobile':
					$styles['height'] = $attributes['wpbs-layout-height-custom-mobile'] ?? $attributes['wpbs-layout-height-mobile'] ?? null;
					break;
				case 'wpbs-layout-width-mobile':
				case 'wpbs-layout-width-custom-mobile':
					$styles['width'] = $attributes['wpbs-layout-width-custom-mobile'] ?? $attributes['wpbs-layout-width-mobile'] ?? null;
					break;
				case 'wpbs-layout-translate-mobile':
					$styles['transform'] = 'translate(' . join( ', ', [
							WPBS::parse_style( $attributes['wpbs-layout-translate-mobile']['top'] ?? '0px' ),
							WPBS::parse_style( $attributes['wpbs-layout-translate-mobile']['left'] ?? '0px' )
						] ) . ')';
					break;
			}

		}

		return $styles;

	}

	public static function render_styles( $styles, $selector, $block = false, $breakpoint = false ): string|false {

		if ( empty( $styles ) || empty( $selector ) ) {
			return false;
		}

		$styles = array_merge( [], $styles, apply_filters( 'wpbs_block_styles', [], $selector ) );

		$css_layout = '';
		$css_hover  = '';
		$css_mobile = '';

		foreach ( $styles['layout'] ?? [] as $prop => $value ) {
			$css_layout .= $prop . ':' . WPBS::parse_style( $value ) . ';';
		}

		foreach ( $styles['hover'] ?? [] as $prop => $value ) {
			$css_hover .= $prop . ':' . WPBS::parse_style( $value ) . ' !important;';
		}

		foreach ( $styles['mobile'] ?? [] as $prop => $value ) {
			$css_mobile .= $prop . ':' . WPBS::parse_style( $value ) . ';';
		}

		$css = join( ' ', array_filter( [
			! empty( $css_layout ) ? $selector . '{' . $css_layout . '}' : null,
			! empty( $css_hover ) ? $selector . ':hover {' . $css_hover . '}' : null,
			! empty( $css_mobile ) ? '@media screen and (max-width: calc(' . $breakpoint . ' - 1px)) { ' . $selector . ' {' . $css_mobile . '}}' : null
		] ) );

		unset( $css_layout );
		unset( $css_hover );
		unset( $css_mobile );

		if ( $block ) {
			wp_add_inline_style( $block->block_type->style_handles[0] ?? false, $css );
		}

		return $css;

	}


	public static function init(): WPBS_Style {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Style();
		}

		return self::$instance;
	}

}


