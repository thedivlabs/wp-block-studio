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

		//add_filter( 'block_type_metadata', [ $this, 'block_style_metadata' ], 1 );

	}

	public function block_style_metadata( $metadata ): array {

		if ( ! str_starts_with( $metadata['name'] ?? false, 'wpbs/' ) ) {
			return $metadata;
		}

		//$metadata['attributes'] = array_merge( $metadata['attributes'] ?? [], self::get_style_attributes() );

		return $metadata;
	}

	public function render_layout_styles( WP_REST_Request $request ): string|false {

		return WPBS_Style::block_styles( $request['attributes'] ?? false, $request['selector'] ?? false );

	}


	private static function get_selector( $block ): string {

		$default = '.wp-block-' . str_replace( '/', '-', $block->block_type->name ?? '' );

		$selector = ! empty( $block->attributes['className'] ) ? $block->attributes['className'] : $block->attributes['uniqueId'] ?? null;

		$selector = $selector ? '.' . join( '.', explode( ' ', $selector ) ) : $default;

		if ( ! empty( $block->block_type->selectors['root'] ) ) {
			$selector = $selector . $block->block_type->selectors['root'];
		}

		return $selector;
	}

	public static function get_breakpoint( $attributes = false ): string|array|false {

		$breakpoints = wp_get_global_settings()['custom']['breakpoints'] ?? false;

		return empty( $attributes ) ? $breakpoints : $breakpoints[ $attributes['wpbs-layout-breakpoint'] ?? 'normal' ] ?? '';
	}

	public static function block_styles( $attributes, $block, $custom_css = '' ): string|false {

		if ( ! is_array( $attributes ) ) {
			return false;
		}

		$breakpoint = self::get_breakpoint( $attributes );

		$components = [
			'layout'     => ( new WPBS_Layout( $attributes ) )->styles(),
			'props'      => ( new WPBS_Props( $attributes ) )->styles(),
			'background' => ( new WPBS_Background( $attributes ) )->styles(),
		];

		$css = '';

		foreach ( $components as $component => $data ) {

			$selector = trim( join( ' ', [
				is_string( $block ) ? $block : self::get_selector( $block ),
				$data['selector'] ?? null
			] ) );

			$styles = [
				'desktop' => array_merge( [], ...array_filter( array_column( $data ?? [], 'desktop' ) ) ),
				'mobile'  => array_merge( [], ...array_filter( array_column( $data ?? [], 'mobile' ) ) ),
				'hover'   => array_merge( [], ...array_filter( array_column( $data ?? [], 'hover' ) ) ),
			];

			if ( empty( $styles ) || empty( $selector ) ) {
				return false;
			}

			$styles = apply_filters( 'wpbs_block_styles_all', $styles, $selector );

			$css_desktop = '';
			$css_hover   = '';
			$css_mobile  = '';

			foreach ( $styles['desktop'] ?? [] ?: [] as $prop => $value ) {

				$css_desktop .= $prop . ':' . WPBS::parse_style( $value ) . ';';
			}

			foreach ( $styles['hover'] ?? [] ?: [] as $prop => $value ) {

				$css_hover .= $prop . ':' . WPBS::parse_style( $value ) . ' !important;';
			}

			foreach ( $styles['mobile'] ?? [] ?: [] as $prop => $value ) {

				$css_mobile .= $prop . ':' . WPBS::parse_style( $value ) . ';';
			}

			$css .= join( ' ', array_filter( [
				! empty( $css_desktop ) ? $selector . '{' . $css_desktop . '}' : null,
				! empty( $css_hover ) ? $selector . ':hover {' . $css_hover . '}' : null,
				! empty( $css_mobile ) ? '@media screen and (max-width: calc(' . $breakpoint . ' - 1px)) { ' . $selector . ' {' . $css_mobile . '}}' : null
			] ) );

			unset( $css_desktop );
			unset( $css_hover );
			unset( $css_mobile );

		}

		$css = join( ' ', array_filter( [
			$css,
			$custom_css
		] ) );

		if ( $block ) {
			wp_add_inline_style( $block->block_type->style_handles[0] ?? false, $css );
		}

		return $css;

	}

	public static function get_style_attributes(): array {

		$layout = [

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


