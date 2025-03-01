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
		'position',
		'positionMobile',
		'eager',
		'force',
		'mask',
		'fixed',
		'size',
		'sizeMobile',
		'opacity',
		'width',
		'height',
		'resolutionMobile',
		'maskMobile',
		'scale',
		'scaleMobile',
		'opacityMobile',
		'widthMobile',
		'heightMobile',
		'fade',
		'fadeMobile',
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
		return strtolower( str_replace( ' ', '', implode( '-', preg_split( '/(?=[A-Z])/', str_replace( 'Mobile', '', $value ) ) ) ) );
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

	private function image_set( $is_mobile = false ): string|false {

		$force = ! empty( $this->attributes['force'] );

		$large  = $this->attributes['largeImage'] ?? false;
		$mobile = $this->attributes['mobileImage'] ?? false;

		$large_id  = $force ? $large['id'] ?? false : ( $large['id'] ?? $mobile['id'] ?? false );
		$mobile_id = $force ? $mobile['id'] ?? false : ( $mobile['id'] ?? $large['id'] ?? false );

		$large_src  = wp_get_attachment_image_src( $large_id, $this->attributes['resolution'] ?? 'large' )[0] ?? false;
		$mobile_src = wp_get_attachment_image_src( $mobile_id, $this->attributes['resolutionMobile'] ?? 'large' )[0] ?? false;

		$large_webp  = file_exists( str_replace( wp_upload_dir()['url'] ?? '', wp_get_upload_dir()['path'] ?? '', $large_src ) . '.webp' ) ? $large_src . '.webp' : false;
		$mobile_webp = file_exists( str_replace( wp_upload_dir()['url'] ?? '', wp_get_upload_dir()['path'] ?? '', $mobile_src ) . '.webp' ) ? $mobile_src . '.webp' : false;

		if ( empty( $large_src ) && empty( $mobile_src ) ) {
			return false;
		}

		$image_set_large = implode( ', ', array_filter( [
			$large_webp ? join( ' ', [
				'url("' . $large_webp . '")',
				'type("image/webp")'
			] ) : null,
			join( ' ', [
				'url("' . $large_src . '")',
				'type("image/jpg")'
			] ),
		] ) );

		$image_set_mobile = implode( ', ', array_filter( [
			$mobile_webp ? join( ' ', [
				'url("' . $mobile_webp . '")',
				'type("image/webp")'
			] ) : null,
			join( ' ', [
				'url("' . $mobile_src . '")',
				'type("image/jpg")'
			] ),
		] ) );


		if ( ! $is_mobile ) {
			return 'image-set(' . $image_set_large . ')';
		} else {
			return 'image-set(' . $image_set_mobile . ')';
		}


	}

	private function mobile(): array|false {

		$attributes = array_filter( $this->attributes, function ( $k ) {

			return str_contains( strtolower( $k ), 'mobile' ) && ! is_array( $this->attributes[ $k ] ) && ! in_array( $k, $this->special );

		}, ARRAY_FILTER_USE_KEY );

		$special_attributes = array_filter( $this->attributes, function ( $k ) {

			return str_contains( strtolower( $k ), 'mobile' ) && in_array( $k, $this->special );

		}, ARRAY_FILTER_USE_KEY );

		$styles = [];

		foreach ( $attributes as $prop => $value ) {

			if ( empty( $value ) ) {
				continue;
			}

			$value = WPBS::parse_style( $value );
			$prop  = $this->parse_prop( $prop );

			$styles[ '--' . $prop ] = $value;

		}

		$styles['--mask-image'] = ! empty( $this->attributes['maskImageMobile']['id'] ) ? 'url(' . wp_get_attachment_image_src( $this->attributes['maskImageMobile']['id'] )[0] . ')' : 'none';

		return array_merge( $styles, $this->special( $special_attributes ) );

	}

	private function special( $attributes ): array|false {

		$props = [];

		foreach ( $attributes as $prop => $value ) {
			if ( empty( $value ) ) {
				continue;
			}
			switch ( $prop ) {
				case 'mobileImage':
					$props['--image'] = $this->image_set( true );
					break;
				case 'largeImage':
					$props['--image'] = $this->image_set();
					break;
				case 'fixed':
					$props['--attachment'] = 'fixed';
					break;
				case 'scale':
				case 'size':
					$scale           = ! empty( $attributes['scale'] ) ? intval( $attributes['scale'] ) . '%' : null;
					$size            = $attributes['size'] ?? null;
					$props['--size'] = $scale ?? $size;
					break;
				case 'scaleMobile':
				case 'sizeMobile':
					$scaleMobile     = ! empty( $attributes['scaleMobile'] ) ? intval( $attributes['scaleMobile'] ) . '%' : null;
					$sizeMobile      = $attributes['sizeMobile'] ?? null;
					$props['--size'] = $scaleMobile ?? $sizeMobile;
					break;
				case 'width':
				case 'widthMobile':
				case 'height':
				case 'heightMobile':
					$props[ '--' . str_replace( 'Mobile', '', $prop ) ] = $value . '%';
					break;
				case 'opacity':
				case 'opacityMobile':
					$props[ '--' . str_replace( 'Mobile', '', $prop ) ] = intval( $value ) / 100;
					break;
				case 'fade':
				case 'fadeMobile':
					$props[ '--fade'] = 'linear-gradient(to bottom, #000000ff '.($value . '%').', #00000000 100%)';
					break;
				case 'position':
					switch ( $value ) {
						case 'top-left':
							$props['--top']  = '0';
							$props['--left'] = '0';
							break;
						case 'top-right':
							$props['--top']   = '0';
							$props['--right'] = '0';
							break;
						case 'bottom-right':
							$props['--bottom'] = '0';
							$props['--right']  = '0';
							break;
						case 'bottom-left':
							$props['--bottom'] = '0';
							$props['--left']   = '0';
							break;
						case 'center':
							$props['--top']       = '50%';
							$props['--left']      = '50%';
							$props['--transform'] = 'translate(-50%,-50%)';
							break;
					}
			}
		}

		return $props;

	}

	private function desktop(): array|false {

		$this->image_set();

		$attributes = array_filter( $this->attributes, function ( $k ) {

			return ! str_contains( strtolower( $k ), 'mobile' ) && ! is_array( $this->attributes[ $k ] ) && ! in_array( $k, $this->special );

		}, ARRAY_FILTER_USE_KEY );

		$special_attributes = array_filter( $this->attributes, function ( $k ) {

			return ! str_contains( strtolower( $k ), 'mobile' ) && in_array( $k, $this->special );

		}, ARRAY_FILTER_USE_KEY );

		$styles = [];

		foreach ( $attributes as $prop => $value ) {

			if ( empty( $value ) ) {
				continue;
			}

			$value = WPBS::parse_style( $value );
			$prop  = $this->parse_prop( $prop );

			$styles[ '--' . $prop ] = $value;

		}

		$styles['--mask-image'] = ! empty( $this->attributes['maskImageLarge']['id'] ) ? 'url(' . wp_get_attachment_image_src( $this->attributes['maskImageLarge']['id'] )[0] . ')' : 'none';

		return array_merge( $styles, $this->special( $special_attributes ) );

	}

}


