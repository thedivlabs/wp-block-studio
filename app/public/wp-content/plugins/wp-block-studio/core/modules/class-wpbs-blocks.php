<?php

class WPBS_Blocks {

	private static WPBS_Blocks $instance;
	public static string|bool $version;

	private function __construct() {

		self::$version = wp_get_theme()->version ?? false;

		add_action( 'init', [ $this, 'register_blocks' ] );

		add_action( 'wp_head', function () {
			$css = get_post_meta( get_the_ID(), '_wpbs_combined_css', true );
			if ( ! empty( $css ) ) {
				echo '<style id="wpbs-style">' . $css . '</style>';
			}
		} );

		add_filter( 'render_block', [ $this, 'render_block' ], 10, 3 );

		add_action( 'save_post', function ( $post_id, $post ) {
			if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
				return;
			}
			if ( wp_is_post_revision( $post_id ) ) {
				return;
			}

			// Only process posts that use WPBS blocks
			if ( ! has_blocks( $post ) ) {
				return;
			}

			$blocks = parse_blocks( $post->post_content );
			if ( empty( $blocks ) ) {
				return;
			}

			$css = self::collect_block_styles( $blocks );

			update_post_meta( $post_id, '_wpbs_combined_css', $css );
		}, 20, 2 );


	}

	private function collect_block_styles( array $blocks ): string {
		$css = '';

		foreach ( $blocks as $block ) {
			if ( ! is_array( $block ) ) {
				continue;
			}

			$name       = $block['blockName'] ?? '';
			$attributes = $block['attrs'] ?? [];

			if ( str_starts_with( $name, 'wpbs/' ) ) {
				$css .= self::parse_block_styles( $attributes, $name );
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				$css .= self::collect_block_styles( $block['innerBlocks'] );
			}
		}

		return trim( $css );
	}

	public static function parse_block_styles( array $attributes, string $name = '' ): string {

		if ( empty( $attributes['uniqueId'] ) ) {
			return '';
		}

		$breakpoints_config = wp_get_global_settings()['custom']['breakpoints'] ?? [];

		$unique_id = $attributes['uniqueId'];
		$selector  = '.wp-block-' . str_replace( '/', '-', $name ) . '.' . $unique_id;

		$parsed_css = $attributes['wpbs-css'] ?? [];

		// Convert associative array to CSS
		$props_to_css = function ( $props = [], $important = false, $importantKeysCustom = [] ) {
			$importantProps = array_merge( [
				'padding',
				'margin',
				'gap',
				'width',
				'min-width',
				'max-width',
				'height',
				'min-height',
				'max-height',
				'color',
				'background-color',
				'border-color',
				'font-size',
				'line-height',
				'letter-spacing',
				'border-width',
				'border-radius',
				'opacity',
				'box-shadow',
				'filter',
			], $importantKeysCustom );

			$result = '';
			foreach ( $props as $k => $v ) {
				if ( $v === null || $v === '' ) {
					continue;
				}
				$needsImportant = $important && array_reduce(
						$importantProps,
						fn( $carry, $sub ) => $carry || str_contains( $k, $sub ),
						false
					);
				$result         .= "{$k}: {$v}" . ( $needsImportant ? ' !important' : '' ) . '; ';
			}

			return trim( $result );
		};

		// Build CSS
		$css    = '';
		$bg_css = '';

		// base props
		if ( ! empty( $parsed_css['props'] ) ) {
			$css .= "{$selector} { " . $props_to_css( $parsed_css['props'] ) . " } ";
		}

		// base background
		if ( ! empty( $parsed_css['background'] ) ) {
			$bg_selector = "{$selector} > .wpbs-background";
			$bg_css      .= "{$bg_selector} { " . $props_to_css( $parsed_css['background'] ) . " } ";
		}

		// hover (mirror JS: selector:hover { rules })
		if ( ! empty( $parsed_css['hover'] ) && is_array( $parsed_css['hover'] ) ) {
			// Make hover strong enough to win typical block styles.
			// props_to_css will add !important for keys in the allowlist when $important = true.
			$css .= "{$selector}:hover { " . $props_to_css(
					$parsed_css['hover'],
					true, // $important
					// keys that should reliably win on hover
					[ 'color', 'background-color', 'border-color', 'outline-color',
						'width','min-width','max-width','height','min-height','max-height',
						'padding','margin','gap','font-size','line-height','letter-spacing',
						'border-width','border-radius','opacity','box-shadow','filter'
					]
				) . " } ";
		}

		// breakpoints
		if ( ! empty( $parsed_css['breakpoints'] ) && is_array( $parsed_css['breakpoints'] ) ) {
			foreach ( $parsed_css['breakpoints'] as $bp_key => $bp_props ) {
				$bp = $breakpoints_config[ $bp_key ] ?? null;
				if ( ! $bp || empty( $bp['size'] ) ) {
					continue;
				}
				$max_width = (int) $bp['size'] - 1;
				$bp_css    = '';

				// layout props at breakpoint
				if ( ! empty( $bp_props['props'] ) ) {
					$bp_css .= "{$selector} { " . $props_to_css( $bp_props['props'], true ) . " } ";
				}

				// background props at breakpoint
				if ( ! empty( $bp_props['background'] ) ) {
					$bg_selector = "{$selector} > .wpbs-background";
					$bp_css      .= "{$bg_selector} { " . $props_to_css( $bp_props['background'], true ) . " } ";
				}

				if ( $bp_css ) {
					$css .= "@media (max-width: {$max_width}px) { {$bp_css} } ";
				}
			}
		}

		$final_css = trim( $bg_css . ' ' . $css );

		return $final_css ?: '';
	}

	public function render_block( $content, $parsed_block, $block ): string {

		if ( ! str_starts_with( $block->name ?? '', 'wpbs/' ) ) {
			return $content;
		}

		//WPBS::console_log( [ $content ] );

		return $content;
	}

	public function register_blocks(): void {

		$block_dirs = glob( WPBS::$path . 'build/*', GLOB_ONLYDIR );

		foreach ( $block_dirs as $block_dir ) {

			$block_object = json_decode( file_get_contents( $block_dir . '/block.json' ), true );

			if ( ! $block_object ) {
				continue;
			}

			$extra_attributes = [
				'uniqueId'     => [
					'type'         => 'string',
					'show_in_rest' => true,
				],
				'wpbs-css'     => [
					'type'         => 'string',
					'show_in_rest' => true,
				],
				'wpbs-preload' => [
					'type'         => 'object',
					'show_in_rest' => true,
				],
				'wpbs-props'   => [
					'type'         => 'object',
					'show_in_rest' => true,
				],
			];

			$block_object['attributes'] = array_merge(
				$block_object['attributes'] ?? [],
				$extra_attributes
			);

			if ( empty( $block_object['editorScript'] ) ) {
				$block_object['editorScript'] = 'wpbs-editor';
			} else {
				$existing                     = (array) $block_object['editorScript'];
				$block_object['editorScript'] = array_merge( [ 'wpbs-editor' ], $existing );
			}

			$block = register_block_type( $block_dir, $block_object );

		}
	}

	public static function init(): WPBS_Blocks {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Blocks();
		}

		return self::$instance;
	}

}


