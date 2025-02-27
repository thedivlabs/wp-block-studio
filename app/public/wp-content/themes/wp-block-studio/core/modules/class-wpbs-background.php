<?php

class WPBS_Background {


	public array $styles = [];

	function __construct( $attributes ) {

		if ( ! is_array( $attributes ) ) {
			return;
		}

		$this->styles = [
			'desktop' => $this->desktop_styles( $attributes ),
			'mobile'  => $this->mobile_styles( $attributes ),
		];

	}

	private function desktop_styles( $attributes ): array|false {

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

	private function mobile_styles( $attributes ): array|false {

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

}


