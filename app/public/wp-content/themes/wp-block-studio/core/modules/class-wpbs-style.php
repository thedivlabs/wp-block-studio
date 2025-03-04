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

	}

	public function render_layout_styles( WP_REST_Request $request ): string|false {

		return WPBS_Style::block_styles( $request['attributes'] ?? false, $request['selector'] ?? false );

	}


	private static function get_selector( $block ): string {

		$selector = ! empty( $block->attributes['className'] ) ? '.' . $block->attributes['className'] : '.wp-block-' . str_replace( '/', '-', $block->block_type->name ?? '' );

		if ( ! empty( $block->block_type->selectors['root'] ) ) {
			$selector = $selector . $block->block_type->selectors['root'];
		}

		return $selector;
	}

	public static function get_breakpoint( $attributes ): string {

		return wp_get_global_settings()['custom']['breakpoints'][ $attributes['wpbs-layout-breakpoint'] ?? 'normal' ] ?? '';
	}

	public static function block_styles( $attributes, $block ): string|false {

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

		if ( $block ) {
			wp_add_inline_style( $block->block_type->style_handles[0] ?? false, $css );
		}

		return $css;

	}


	public static function init(): WPBS_Style {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Style();
		}

		return self::$instance;
	}

}


