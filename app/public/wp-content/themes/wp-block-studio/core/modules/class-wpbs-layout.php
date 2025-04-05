<?php

class WPBS_Layout {

	public array|bool $desktop = [];
	public array|bool $mobile = [];
	public array|bool $hover = [];

	private array $attributes = [];

	function __construct( $attributes ) {

		if ( ! is_array( $attributes ) ) {
			return;
		}

		$this->attributes = $attributes;

		unset( $attributes );

		$this->desktop = $this->desktop();
		$this->mobile  = $this->mobile();
		$this->hover   = $this->hover();

		unset( $this->attributes );

		if ( ! empty( $this->desktop['mask-image'] ) && empty( $this->mobile['mask-image'] ) ) {
			$this->mobile['mask-image'] = 'none';
		}

	}

	public function styles(): array {
		return apply_filters( 'wpbs_block_styles_layout', [
			'selector' => false,
			'styles'   => [
				'desktop' => $this->desktop,
				'mobile'  => $this->mobile,
				'hover'   => $this->hover,
			]
		] );
	}

	private function desktop(): array|false {

		if ( empty( $this->attributes ) ) {
			return false;
		}

		$style_attributes = array_filter( [
			'column-gap' => $this->attributes['style']['spacing']['blockGap']['top'] ?? null,
			'row-gap'    => $this->attributes['style']['spacing']['blockGap']['left'] ?? null,
		] );

		$special_attributes = array_filter( $this->attributes, function ( $k ) {
			return in_array( $k, [
				'wpbs-layout-mask-image',
				'wpbs-layout-mask-size',
				'wpbs-layout-mask-origin',
				'wpbs-layout-container',
				'wpbs-layout-width',
				'wpbs-layout-width-custom',
				'wpbs-layout-height',
				'wpbs-layout-height-custom',
				'wpbs-layout-min-height',
				'wpbs-layout-min-height-custom',
				'wpbs-layout-max-height',
				'wpbs-layout-max-height-custom',
				'wpbs-layout-offset-header',
				'wpbs-layout-translate',
			] );
		}, ARRAY_FILTER_USE_KEY );

		$layout_attributes = array_filter( $this->attributes, function ( $k ) use ( $special_attributes ) {

			return str_starts_with( $k, 'wpbs-layout' ) &&
			       ! is_array( $this->attributes[ $k ] ) &&
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
				case 'wpbs-layout-mask-image':
					$styles['mask-image']    = 'url(' . ( wp_get_attachment_image_src( $value['id'] ?? false, 'full' )[0] ?? '#' ) . ')';
					$styles['mask-repeat']   = 'no-repeat';
					$styles['mask-size']     = match ( $this->attributes['wpbs-layout-mask-size'] ?? false ) {
						'cover' => 'cover',
						'horizontal' => '100% auto',
						'vertical' => 'auto 100%',
						default => 'contain'
					};
					$styles['mask-position'] = $this->attributes['wpbs-layout-mask-origin'] ?? 'center center';
					break;
				case 'wpbs-layout-height':
				case 'wpbs-layout-height-custom':
					$styles['height'] = $this->parse_special( 'height', $this->attributes['wpbs-layout-height-custom'] ?? $this->attributes['wpbs-layout-height'] ?? null );
					break;
				case 'wpbs-layout-min-height':
				case 'wpbs-layout-min-height-custom':
					$styles['min-height'] = $this->parse_special( 'min-height', $this->attributes['wpbs-layout-min-height-custom'] ?? $this->attributes['wpbs-layout-min-height'] ?? null );
					break;
				case 'wpbs-layout-max-height':
				case 'wpbs-layout-max-height-custom':
					$styles['max-height'] = $this->parse_special( 'max-height', $this->attributes['wpbs-layout-min-height-custom'] ?? $this->attributes['wpbs-layout-min-height'] ?? null );
					break;
				case 'wpbs-layout-width':
				case 'wpbs-layout-width-custom':
					$styles['width'] = $this->attributes['wpbs-layout-width-custom'] ?? $this->attributes['wpbs-layout-width'] ?? null;
					break;
				case 'wpbs-layout-translate':
					$styles['transform'] = 'translate(' . join( ', ', [
							WPBS::parse_style( $this->attributes['wpbs-layout-translate']['top'] ?? '0px' ),
							WPBS::parse_style( $this->attributes['wpbs-layout-translate']['left'] ?? '0px' )
						] ) . ')';
					break;
				case 'wpbs-layout-offset-header':
					$styles['padding-top'] = 'calc(' . join( ' + ', [
							WPBS::parse_style( $this->attributes['style']['spacing']['padding']['top'] ?? '0px' ),
							'var(--wpbs-header-height, 0px)'
						] ) . ') !important';
					break;
			}

		}

		return $styles;

	}

	private function hover(): array|false {

		if ( empty( $this->attributes ) ) {
			return false;
		}

		$hover_attributes = array_filter( $this->attributes, function ( $k ) {

			return str_starts_with( $k, 'wpbs-layout' ) &&
			       str_contains( $k, 'hover' ) &&
			       ! is_array( $this->attributes[ $k ] ) &&
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

	private function mobile(): array|false {

		if ( empty( $this->attributes ) ) {
			return false;
		}

		$special_attributes = array_filter( $this->attributes, function ( $k ) {
			return in_array( $k, [
				'wpbs-layout-mask-image-mobile',
				'wpbs-layout-mask-origin-mobile',
				'wpbs-layout-mask-size-mobile',
				'wpbs-layout-width-mobile',
				'wpbs-layout-width-custom-mobile',
				'wpbs-layout-height-mobile',
				'wpbs-layout-height-custom-mobile',
				'wpbs-layout-min-height-mobile',
				'wpbs-layout-min-height-custom-mobile',
				'wpbs-layout-max-height-mobile',
				'wpbs-layout-max-height-custom-mobile',
				'wpbs-layout-translate-mobile',
			] );
		}, ARRAY_FILTER_USE_KEY );

		$mobile_attributes = array_filter( $this->attributes, function ( $k ) use ( $special_attributes ) {

			return str_starts_with( $k, 'wpbs-layout' ) &&
			       str_contains( $k, 'mobile' ) &&
			       ! is_array( $this->attributes[ $k ] ) &&
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
				case 'wpbs-layout-mask-image-mobile':
					$styles['mask-image']    = 'url(' . ( wp_get_attachment_image_src( $value['id'] ?? false, 'full' )[0] ?? '#' ) . ')';
					$styles['mask-repeat']   = 'no-repeat';
					$styles['mask-size']     = match ( $this->attributes['wpbs-layout-mask-size-mobile'] ?? false ) {
						'cover' => 'cover',
						'horizontal' => '100% auto',
						'vertical' => 'auto 100%',
						default => 'contain'
					};
					$styles['mask-position'] = $this->attributes['wpbs-layout-mask-origin-mobile'] ?? 'center center';
					break;
				case 'wpbs-layout-height-mobile':
				case 'wpbs-layout-height-custom-mobile':
					$styles['height'] = $this->attributes['wpbs-layout-height-custom-mobile'] ?? $this->attributes['wpbs-layout-height-mobile'] ?? null;
					break;
				case 'wpbs-layout-min-height-mobile':
				case 'wpbs-layout-min-height-custom-mobile':
					$styles['min-height'] = $this->attributes['wpbs-layout-min-height-custom-mobile'] ?? $this->attributes['wpbs-layout-min-height-mobile'] ?? null;
					break;
				case 'wpbs-layout-max-height-mobile':
				case 'wpbs-layout-max-height-custom-mobile':
					$styles['max-height'] = $this->attributes['wpbs-layout-max-height-custom-mobile'] ?? $this->attributes['wpbs-layout-max-height-mobile'] ?? null;
					break;
				case 'wpbs-layout-width-mobile':
				case 'wpbs-layout-width-custom-mobile':
					$styles['width'] = $this->attributes['wpbs-layout-width-custom-mobile'] ?? $this->attributes['wpbs-layout-width-mobile'] ?? null;
					break;
				case 'wpbs-layout-translate-mobile':
					$styles['transform'] = 'translate(' . join( ', ', [
							WPBS::parse_style( $this->attributes['wpbs-layout-translate-mobile']['top'] ?? '0px' ),
							WPBS::parse_style( $this->attributes['wpbs-layout-translate-mobile']['left'] ?? '0px' )
						] ) . ')';
					break;
			}

		}

		return $styles;

	}

	private function parse_special( $prop = false, $value = false ): string|false {

		if ( empty( $prop ) || empty( $value ) || ! is_string( $prop ) || ! is_string( $value ) ) {
			return false;
		}

		switch ( $prop ) {
			case 'height':
			case 'min-height':
			case 'max-height':
				$value = match ( $value ) {
					'screen' => 'calc(100svh - var(--wpbs-header-height, 0px))',
					'full-screen' => '100svh',
					default => $value
				};
				break;
		}

		return $value;

	}

}


