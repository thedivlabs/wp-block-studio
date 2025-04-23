<?php

class WPBS_Style {

	private static WPBS_Style $instance;

	private function __construct() {

	}



	public static function get_style_attributes(): array {

		$layout = [
			'wpbs-css'                      => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-background'                      => [
				'show_in_rest' => true,
				'type'         => 'object',
			],
			'wpbs-layout-offset-header'            => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-display'                  => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-mask-image'               => [
				'show_in_rest' => true,
				'type'         => 'object',
			],
			'wpbs-layout-mask-origin'              => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-mask-size'                => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-flex-direction'           => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-container'                => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-align-items'              => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-justify-content'          => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-opacity'                  => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-basis'                    => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-width'                    => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-width-custom'             => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-max-width'                => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-height'                   => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-height-custom'            => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-min-height'               => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-min-height-custom'        => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-max-height'               => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-max-height-custom'        => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-flex-wrap'                => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-flex-grow'                => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-flex-shrink'              => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-position'                 => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-z-index'                  => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-top'                      => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-right'                    => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-bottom'                   => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-left'                     => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-overflow'                 => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-aspect-ratio'             => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-order'                    => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-translate'                => [
				'show_in_rest' => true,
				'type'         => 'object',
			],
			'wpbs-layout-outline'                  => [
				'show_in_rest' => true,
				'type'         => 'object',
			],
			'wpbs-layout-mask-image-mobile'        => [
				'show_in_rest' => true,
				'type'         => 'object',
			],
			'wpbs-layout-mask-origin-mobile'       => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-mask-size-mobile'         => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-offset-header-mobile'     => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-display-mobile'           => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-breakpoint'               => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-align-items-mobile'       => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-justify-content-mobile'   => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-opacity-mobile'           => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-basis-mobile'             => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-width-mobile'             => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-width-custom-mobile'      => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-max-width-mobile'         => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-height-mobile'            => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-height-custom-mobile'     => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-min-height-mobile'        => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-min-height-custom-mobile' => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-max-height-mobile'        => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-max-height-custom-mobile' => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-flex-grow-mobile'         => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-flex-shrink-mobile'       => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-flex-direction-mobile'    => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-aspect-ratio-mobile'      => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-position-mobile'          => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-z-index-mobile'           => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-top-mobile'               => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-right-mobile'             => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-bottom-mobile'            => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-left-mobile'              => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-order-mobile'             => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-translate-mobile'         => [
				'show_in_rest' => true,
				'type'         => 'object',
			],
			'wpbs-layout-padding-mobile'           => [
				'show_in_rest' => true,
				'type'         => 'object',
			],
			'wpbs-layout-margin-mobile'            => [
				'show_in_rest' => true,
				'type'         => 'object',
			],
			'wpbs-layout-gap-mobile'               => [
				'show_in_rest' => true,
				'type'         => 'object',
			],
			'wpbs-layout-border-radius-mobile'     => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-font-size-mobile'         => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-line-height-mobile'       => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-text-align-mobile'        => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-flex-wrap-mobile'         => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-text-color-hover'         => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-background-color-hover'   => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-border-color-hover'       => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-text-color-mobile'        => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
			'wpbs-layout-background-color-mobile'  => [
				'show_in_rest' => true,
				'type'         => 'string',
			],
		];

		foreach ( $layout as $prop => $def ) {

			$layout[ $prop ]['show_in_rest'] = true;
			$layout[ $prop ]['schema']       = array_filter( [
				'type'                 => $def['type'],
				'additionalProperties' => match ( $def['type'] ) {
					'object' => true,
					default => null
				},
				'context'              => [ 'edit', 'view' ]
			] );
			$layout[ $prop ]['default']      = match ( $def['type'] ) {
				'object' => [],
				'boolean' => false,
				default => ''
			};

		}

		return array_merge( [], $layout );
	}


	public static function init(): WPBS_Style {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Style();
		}

		return self::$instance;
	}

}


