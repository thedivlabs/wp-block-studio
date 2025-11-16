<?php

class WPBS_Blocks {

	private static WPBS_Blocks $instance;
	public static string|bool $version;

	private function __construct() {

		self::$version = wp_get_theme()->version ?? false;

		add_action( 'init', [ $this, 'register_blocks' ] );

		add_action( 'wp_head', function () {
			$id  = get_queried_object_id();
			$css = $id ? get_post_meta( $id, '_wpbs_combined_css', true ) : '';

			if ( $css ) {
				echo '<style id="wpbs-style">' . $css . '</style>';
			}
		} );


		add_filter( 'render_block', [ $this, 'render_block' ], 10, 3 );

		// --- Unified CSS builder registration -------------------------------------

// Normal posts/pages
		add_action( 'save_post', function ( $post_id, $post ) {
			$this->handle_content_saved( $post_id, $post->post_type, $post->post_content );
		}, 20, 2 );

// Templates
		add_action( 'rest_after_insert_wp_template', function ( $template, $request ) {
			$this->handle_content_saved( $template->ID, 'wp_template', $template->content );
		}, 20, 2 );

// Template parts
		add_action( 'rest_after_insert_wp_template_part', function ( $template_part, $request ) {
			$this->handle_content_saved( $template_part->ID, 'wp_template_part', $template_part->content );
		}, 20, 2 );


		add_action( 'wp_head', [ $this, 'output_preload_media' ] );
		add_filter( 'render_block_data', [ $this, 'collect_preload_media' ], 10, 2 );

	}

	/**
	 * Unified entry point for generating CSS after *any* block-based content is saved.
	 */
	private function handle_content_saved( int $post_id, string $type, string $content ): void {

		if ( in_array( $type, [ 'wp_template', 'wp_template_part' ], true ) ) {
			// Prevent double-triggering from save_post for templates
			if ( did_action( 'rest_after_insert_' . $type ) ) {
				return;
			}
		}


		// Prevent autosaves/revisions
		if ( wp_is_post_revision( $post_id ) ) {
			return;
		}
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		// Parse blocks safely
		if ( ! has_blocks( $content ) ) {
			delete_post_meta( $post_id, '_wpbs_combined_css' ); // prevents stale CSS

			return;
		}

		$blocks = parse_blocks( $content );
		if ( empty( $blocks ) ) {
			delete_post_meta( $post_id, '_wpbs_combined_css' );

			return;
		}

		// Build CSS
		$css = self::collect_block_styles( $blocks );

		// Store
		update_post_meta( $post_id, '_wpbs_combined_css', $css );
	}


	public function collect_preload_media( array $block, array $source_block ): array {


		if (
			! str_starts_with( $block['blockName'], 'wpbs' )
		) {
			return $block;
		}


		if (
			! empty( $block['attrs']['wpbs-preload'] )
		) {

			//WPBS::console_log( $block );
		}


		// Register a collector on this block for later
		add_filter( 'wpbs_preload_media', function ( array $carry ) use ( $block ) {

			$preload = $block['attrs']['wpbs-preload'] ?? null;

			if ( is_array( $preload ) && ! empty( $preload ) ) {
				// merge block's preload items into the accumulator
				$carry = array_merge( $carry, $preload );
			}

			return $carry;
		} );

		return $block;
	}

	public function output_preload_media(): void {

		// Ask all blocks to report their preload items
		$items = apply_filters( 'wpbs_preload_media', [] );

		if ( empty( $items ) || ! is_array( $items ) ) {
			return;
		}

		// Load theme.json breakpoints
		$settings    = wp_get_global_settings();
		$breakpoints = $settings['custom']['breakpoints'] ?? [];

		// Deduplicate
		$unique = [];

		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}

			// Normalize only relevant keys
			$keyData = [
				'id'         => $item['id'] ?? null,
				'resolution' => $item['resolution'] ?? null,
				'bp'         => $item['media'] ?? null, // breakpoint key
				'type'       => $item['type'] ?? null,
			];

			// Build natural uniqueness key
			$key = json_encode( $keyData, JSON_UNESCAPED_SLASHES );

			$unique[ $key ] = $item;
		}

		// Output preload tags
		foreach ( $unique as $item ) {

			$id    = $item['id'] ?? null;
			$type  = $item['type'] ?? null;
			$bpKey = $item['media'] ?? null; // breakpoint key
			$size  = $item['resolution'] ?? 'full';

			if ( ! $id || ! $type ) {
				continue;
			}

			// Resolve URL
			$src = wp_get_attachment_image_url( $id, $size );
			if ( ! $src ) {
				continue;
			}

			// Resolve media query from theme.json breakpoint key
			$mediaAttr = '';
			if ( $bpKey && isset( $breakpoints[ $bpKey ] ) ) {
				$mq = $breakpoints[ $bpKey ];
				if ( is_array( $mq ) && isset( $mq['query'] ) ) {
					$mediaAttr = $mq['query'];
				} elseif ( is_string( $mq ) ) {
					$mediaAttr = $mq;
				}
			}

			echo '<link rel="preload" href="' . esc_url( $src ) . '" as="' . esc_attr( $type ) . '"'
			     . ( $mediaAttr ? ' media="' . esc_attr( $mediaAttr ) . '"' : '' )
			     . ' />' . "\n";
		}
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

			// 1. Handle innerBlocks as before
			if ( ! empty( $block['innerBlocks'] ) ) {
				$css .= self::collect_block_styles( $block['innerBlocks'] );
			}

			// 2. Handle referenced patterns (core/block)
			if ( $block['blockName'] === 'core/block' && ! empty( $block['attrs']['ref'] ) ) {
				$ref_id   = intval( $block['attrs']['ref'] );
				$ref_post = get_post( $ref_id );

				if ( $ref_post && has_blocks( $ref_post->post_content ) ) {
					$ref_blocks = parse_blocks( $ref_post->post_content );
					$css        .= self::collect_block_styles( $ref_blocks );
				}
			}

			// 3. Handle template-part references
			/*if ( $block['blockName'] === 'core/template-part' && ! empty( $block['attrs']['slug'] ) ) {
				$slug = $block['attrs']['slug'];

				$template_part = wp_get_post_template_part( $slug ); // loads template-part post by slug

				if ( $template_part && has_blocks( $template_part->post_content ) ) {
					$tp_blocks = parse_blocks( $template_part->post_content );
					$css       .= self::collect_block_styles( $tp_blocks );
				}
			}*/

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
					[
						'color',
						'background-color',
						'border-color',
						'outline-color',
						'width',
						'min-width',
						'max-width',
						'height',
						'min-height',
						'max-height',
						'padding',
						'margin',
						'gap',
						'font-size',
						'line-height',
						'letter-spacing',
						'border-width',
						'border-radius',
						'opacity',
						'box-shadow',
						'filter'
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


