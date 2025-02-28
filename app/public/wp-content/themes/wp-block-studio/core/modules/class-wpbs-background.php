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
		'resolution',
		'eager',
		'force',
		'mask',
		'fixed',
		'scale',
		'opacity',
		'width',
		'height',
		'resolutionMobile',
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

	private function image_set(): array|false {

		$force = ! empty( $this->attributes['force'] );

		$large  = $this->attributes['largeImage'] ?? false;
		$mobile = $this->attributes['mobileImage'] ?? false;

		$large_id  = $force ? $large['id'] ?? false : ( $large['id'] ?? $mobile['id'] ?? false );
		$mobile_id = $force ? $mobile['id'] ?? false : ( $mobile['id'] ?? $large['id'] ?? false );

		$large_src  = wp_get_attachment_image_src( $large_id, $this->attributes['resolution'] ?? 'large' )[0] ?? false;
		$mobile_src = wp_get_attachment_image_src( $mobile_id, $this->attributes['resolutionMobile'] ?? 'large' )[0] ?? false;

		$large_webp  = file_exists( str_replace( wp_upload_dir()['url'] ?? '', wp_get_upload_dir()['path'] ?? '', $large_src ) . '.webp' ) ? $large_src . '.webp' : false;
		$mobile_webp = file_exists( str_replace( wp_upload_dir()['url'] ?? '', wp_get_upload_dir()['path'] ?? '', $mobile_src ) . '.webp' ) ? $mobile_src . '.webp' : false;

		WPBS::console_log( $large_src . '.webp' );
		WPBS::console_log( $mobile_webp );


		/*$large_webp = realpath(get_attached_file($large_id, true)) . '.webp';
		$mobile_webp = realpath(get_attached_file($mobile_id, true)) . '.webp';*/

		if ( empty( $large_src ) && empty( $mobile_src ) ) {
			return false;
		}

		$image_set_large  = array_filter( [
			//$large_webp ? '' : null,
		] );
		$image_set_mobile = [];


		return [
			'--image-large'  => 'image-set(' . implode( ', ', $image_set_large ) . ')',
			'--image-mobile' => 'image-set(' . implode( ', ', $image_set_mobile ) . ')',
		];


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

		$this->image_set();

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


