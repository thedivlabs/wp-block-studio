<?php

class WPBS_Background {

	public array $desktop = [];
	public array $mobile = [];

	private array $attributes = [];
	private array $special = [
		'type',
		'mobileImage',
		'largeImage',
		'mobileVideo',
		'largeVideo',
		'maskImageMobile',
		'maskImageLarge',
		'eager',
		'force',
		'mask',
		'fixed',
		'scale',
		'opacity',
		'width',
		'height',
		'maskMobile',
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

	private function parse_prop( $value ): string {
		return strtolower( str_replace( ' ', '', implode( '-', preg_split( '/(?=[A-Z])/', $value ) ) ) );
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

	private function image_set( $large, $mobile ): string|false {

		$force = ! empty( $this->attributes['force'] );

		$large_id  = $force ? $large['id'] ?? false : ( $large['id'] ?? $mobile['id'] ?? false );
		$mobile_id = $force ? $mobile['id'] ?? false : ( $mobile['id'] ?? $large['id'] ?? false );

		if ( empty( $large_id ) && empty( $mobile_id ) ) {
			return false;
		}

		$image_set = array_filter([

		]);

		return 'image-set(' . implode(', ', $image_set) . ')';


	}

	private function mobile(): array|false {

		$attributes = array_filter( $this->attributes, function ( $k ) {

			return str_contains( strtolower( $k ), 'mobile' ) && ! is_array( $this->attributes[ $k ] ) && ! in_array( $k, $this->special );

		}, ARRAY_FILTER_USE_KEY );

		$styles = [];

		foreach ( $attributes as $prop => $value ) {

			if ( empty( $value ) ) {
				continue;
			}

			$value = $this->parse_prop( $value );
			$prop  = $this->parse_prop( $prop );

			$styles[ '--' . $prop ] = $value;

		}

		return $styles;

	}

	private function special(): array {

		$styles = [];

		foreach ( $this->special as $prop => $value ) {

			switch ( $prop ) {
				case 'mobileImage':
					$styles['--image-mobile'] = 'url(' . $value . ')';

			}

		}

		return $styles;

	}

	private function desktop(): array|false {


		$attributes = array_filter( $this->attributes, function ( $k ) {

			return ! str_contains( strtolower( $k ), 'mobile' ) && ! is_array( $this->attributes[ $k ] ) && ! in_array( $k, $this->special );

		}, ARRAY_FILTER_USE_KEY );

		$styles = [];

		foreach ( $attributes as $prop => $value ) {

			if ( empty( $value ) ) {
				continue;
			}

			$value = $this->parse_prop( $value );
			$prop  = $this->parse_prop( $prop );

			$styles[ '--' . $prop ] = $value;

		}

		return array_merge( $styles, $this->special() );

	}

}


