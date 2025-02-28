<?php

class WPBS_Background {

	public array $desktop = [];
	public array $mobile = [];
	public array $hover = [];

	private array $attributes = [];
	private array $special_attributes = [
		'eager',
		'fixed',
		'force',
		'largeImage',
		'mobileImage',
		'largeVideo',
		'mobileVideo',
		'mask',
		'maskImageLarge',
		'maskImageMobile',
		'type',
		'scale',
		'opacity',
		'width',
		'height',
		'scaleMobile',
		'opacityMobile',
		'widthMobile',
		'heightMobile',
	];

	function __construct( $attributes ) {

		if ( ! is_array( $attributes['wpbs-background'] ) ) {
			return;
		}

		$this->attributes = $attributes['wpbs-background'];

		unset( $attributes );

		$this->desktop = $this->desktop();
		$this->mobile  = $this->mobile();

		unset( $this->attributes );

	}

	public function styles(): array {
		return apply_filters( 'wpbs_block_styles_background', [
			'selector' => '.wpbs-background',
			'styles'   => [
				'desktop' => $this->desktop,
				'mobile'  => $this->mobile,
			]
		] );
	}

	private function mobile(): array|false {

		$attributes = array_filter( $this->attributes, function ( $k ) {

			return str_contains( $k, 'mobile' ) && ! is_array( $this->attributes[ $k ] ) && ! in_array( $k, $this->special_attributes );

		}, ARRAY_FILTER_USE_KEY );

		$styles = [];

		return $styles;

	}

	private function special_attributes(): array|false {

		$attributes = array_filter( $this->attributes, function ( $k ) {

			return true;

		}, ARRAY_FILTER_USE_KEY );

		WPBS::console_log( $attributes );

		return (array) $attributes;

	}

	private function desktop(): array|false {


		$attributes = array_filter( $this->attributes, function ( $k ) {

			return ! str_contains( $k, 'mobile' ) && ! is_array( $this->attributes[ $k ] ) && ! in_array( $k, $this->special_attributes );

		}, ARRAY_FILTER_USE_KEY );

		$styles = [];

		foreach ( $attributes as $prop => $value ) {

			if ( empty( $value ) ) {
				continue;
			}

			$value = str_replace( ' ', '', implode( '-', preg_split( '/(?=[A-Z])/', $value ) ) );

			$styles[ '--' . $prop ] = $value;

		}

		$special_attributes = $this->special_attributes();


		/*foreach ( $special_attributes as $prop => $value ) {

			if ( empty( $value ) ) {
				continue;
			}

			switch ( $prop ) {
				case 'wpbs-layout-height':
				case 'wpbs-layout-height-custom':
					$styles['height'] = $this->attributes['wpbs-layout-height-custom'] ?? $this->attributes['wpbs-layout-height'] ?? null;
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
						] ) . ')';
					break;
			}

		}*/

		return $styles;

	}

}


