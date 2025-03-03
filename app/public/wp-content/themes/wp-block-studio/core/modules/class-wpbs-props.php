<?php

class WPBS_Props {

	public array|bool $desktop = [];
	public array|bool $mobile = [];

	private array $attributes = [];

	function __construct( $attributes ) {

		if ( ! is_array( $attributes ) ) {
			return;
		}

		$this->attributes = $attributes;

		unset( $attributes );

		$this->desktop = $this->desktop();
		$this->mobile  = $this->mobile();

		unset( $this->attributes );

	}

	public function styles(): array {
		return apply_filters( 'wpbs_block_styles_props', [
			'selector' => false,
			'styles'   => [
				'desktop' => $this->desktop,
				'mobile'  => $this->mobile,
			]
		] );
	}

	private function desktop(): array|false {

		if ( empty( $this->attributes ) ) {
			return false;
		}

		$prop_attributes = array_filter( $this->attributes, function ( $k ) {

			return str_starts_with( $k, 'wpbs-prop' ) &&
			       ! is_array( $this->attributes[ $k ] ) &&
			       ! ( str_contains( $k, 'mobile' ) );

		}, ARRAY_FILTER_USE_KEY );

		$styles = [];

		foreach ( $prop_attributes as $prop => $value ) {

			if ( empty( $value ) ) {
				continue;
			}

			$prop_name = str_replace( 'wpbs-prop-', '', $prop );

			$styles[ '--' . $prop_name ] = $value;

		}

		return $styles;

	}

	private function mobile(): array|false {

		if ( empty( $this->attributes ) ) {
			return false;
		}

		$mobile_attributes = array_filter( $this->attributes, function ( $k ) {

			return str_starts_with( $k, 'wpbs-prop' ) &&
			       str_contains( $k, 'mobile' ) &&
			       ! is_array( $this->attributes[ $k ] );

		}, ARRAY_FILTER_USE_KEY );

		$styles = [];

		foreach ( $mobile_attributes as $prop => $value ) {

			if ( empty( $value ) ) {
				continue;
			}

			$prop_name = str_replace( [ 'wpbs-prop-', '-mobile' ], '', $prop );

			$styles[ '--' . $prop_name ] = $value;

		}
		
		return $styles;

	}

}


