<?php

class WPBS_Blocks {

	private static WPBS_Blocks $instance;
	public static string|bool $version;

	private function __construct() {

		self::$version = wp_get_theme()->version ?? false;

		add_action( 'init', [ $this, 'register_blocks' ] );
		add_filter( 'register_block_type_args', [ $this, 'block_args' ], 10, 3 );

	}

	public function render_block( $attributes, $content, $block ): string {

		$this->layout_styles( $attributes, $block );

		return $content;
	}

	private function layout_styles( $attributes, $block ): void {

		$selector   = $block->block_type->selectors['root'] ?? '.' . str_replace( '/', '-', $block->block_type->name ?? false );
		$breakpoint = match ( $attributes['wpbs-breakpoint'] ?? false ) {
			'lg' => '1200px',
			default => '768px'
		};

		$attributes_layout = array_filter( $attributes, function ( $k ) {
			return str_starts_with( $k, 'wpbs' ) && ( ! str_contains( $k, 'mobile' ) );
		}, ARRAY_FILTER_USE_KEY );

		$attributes_mobile = array_filter( $attributes, function ( $k ) {
			return str_starts_with( $k, 'wpbs' ) && str_contains( $k, 'mobile' );
		}, ARRAY_FILTER_USE_KEY );

		$css = '';

		foreach ( $attributes_layout as $prop => $value ) {

			$prop = str_replace( 'wpbs-', '', $prop );

			$css .= $prop . ':' . $value . ';';
		}

		if ( ! empty( $attributes_mobile ) ) {

			$css .= '@media and screen and (max-width: ' . $breakpoint . ') {';

			foreach ( $attributes_mobile as $prop => $value ) {

				$prop = str_replace( [ 'wpbs-', '-mobile' ], '', $prop );

				$css .= $prop . ':' . $value . ';';
			}

			$css .= '}';
		}

		$data = join( ' ', [ $selector, '{', $css, '}' ] );

		wp_add_inline_style( $block->block_type->style_handles[0] ?? false, $data );

		WPBS::console_log( $attributes_layout );
		WPBS::console_log( $attributes_mobile );


	}

	public function block_args( $args, $block_type ): array {


		if ( str_starts_with( $block_type, 'wpbs' ) ) {

			$args['render_callback'] = [ $this, 'render_block' ];
		}

		return $args;

	}

	public function register_blocks(): void {

		$block_dirs = glob( WPBS::$path . '/blocks/*', GLOB_ONLYDIR );

		foreach ( $block_dirs as $block_dir ) {
			register_block_type( $block_dir );
		}
	}

	public static function init(): WPBS_Blocks {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Blocks();
		}

		return self::$instance;
	}

}


