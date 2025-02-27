<?php

class WPBS_Background {

	public array $desktop = [];
	public array $mobile = [];
	public array $hover = [];

	private array $attributes = [];

	function __construct( $attributes ) {

		if ( ! is_array( $attributes['wpbs-background'] ) ) {
			return;
		}

		$this->attributes = $attributes['wpbs-background'];

		unset( $attributes );

		$this->desktop = $this->desktop();
		//$this->mobile  = $this->mobile();

		unset( $this->attributes );

	}

	public function styles(): array {
		return apply_filters( 'wpbs_block_styles_background', [
			'selector' => '.wpbs-background',
			'props'    => true,
			'styles'   => [
				'desktop' => $this->desktop,
				'mobile'  => $this->mobile,
			]
		] );
	}

	private function mobile(): array|false {
		if ( empty( $this->attributes ) ) {
			return false;
		}

		$styles = [];

		return $styles;

	}

	private function desktop(): array|false {


		$attributes = array_filter( $this->attributes, function ( $k ) {

			return ! str_contains( $k, 'mobile' ) && ! is_array( $this->attributes[ $k ] );

		}, ARRAY_FILTER_USE_KEY );

		$styles = [];

		foreach ( $attributes as $prop => $value ) {

			if ( empty( $value ) ) {
				continue;
			}

			$styles[ $prop ] = $value;

		}


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


