<?php

class WPBS_Blocks {

	private static WPBS_Blocks $instance;
	public static string|bool $version;


	private function __construct() {

		self::$version = wp_get_theme()->version ?? false;

		add_action( 'init', [ $this, 'register_blocks' ] );

		if ( ! is_admin() ) {
			add_filter( 'render_block', [ $this, 'render_block' ], 10, 3 );
			add_action( 'wp_head', [ $this, 'output_preload_media' ] );
			add_filter( 'render_block_data', [ $this, 'collect_preload_media' ], 10, 2 );
			add_filter( 'render_block_data', [ $this, 'handle_block_styles' ], 10, 2 );
		}

	}

	public function handle_block_styles( array $block, array $source_block ): array {
		if ( is_admin() || empty( $block['blockName'] ) || ! str_starts_with( $block['blockName'], 'wpbs/' ) ) {
			return $block;
		}

		if ( did_action( 'wp_head' ) > 0 ) {
			return $block;
		}

		$attrs     = $block['attrs'] ?? [];
		$unique_id = $attrs['uniqueId'] ?? null;

		if ( ! $unique_id ) {
			return $block;
		}

		$css = self::parse_block_styles( $attrs, $block['blockName'] );

		if ( $css ) {
			$this->push_critical_css( $css );
		}

		return $block;
	}

	public function collect_preload_media( array $block, array $source_block ): array {

		if (
			! str_starts_with( $block['blockName'], 'wpbs' ) ||
			is_admin()
		) {
			return $block;
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

		// Gather all items reported from blocks
		$items = apply_filters( 'wpbs_preload_media', [] );

		if ( empty( $items ) || ! is_array( $items ) ) {
			return;
		}

		$deduped = [];

		// Deduplicate items by id + breakpoint + resolution
		foreach ( $items as $item ) {
			if ( ! is_array( $item ) || empty( $item['id'] ) || empty( $item['type'] ) ) {
				continue;
			}

			$id    = $item['id'];
			$type  = $item['type'];
			$size  = $item['resolution'] ?? 'large';
			$bpKey = $item['breakpoint'] ?? $item['media'] ?? null;

			// Dedup key
			$key = implode( '|', [ $id, $bpKey, $size ] );

			if ( isset( $deduped[ $key ] ) ) {
				continue; // skip duplicates
			}

			$deduped[ $key ] = [
				'id'         => $id,
				'type'       => $type,
				'size'       => $size,
				'breakpoint' => $bpKey,
			];
		}

		WPBS::console_log( $deduped );

		// Output <link> for each deduped item
		foreach ( $deduped as $item ) {

			$id    = $item['id'];
			$type  = $item['type'];
			$size  = $item['size'];
			$bpKey = $item['breakpoint'];

			// Resolve URL
			if ( $type === 'video' || empty( $type ) ) {
				$src = $this->resolve_video_url( $id ); // implement this
				$as  = 'video';
			} else {
				$src = $this->resolve_image_url( $id, $size );
				$as  = 'image';
			}

			if ( ! $src || $src === '#' ) {
				continue;
			}

			// Build attributes
			$attrs = [
				'rel'           => 'preload',
				'as'            => $as,
				'data-href'     => esc_url( $src ),
				'data-media'    => esc_attr( $bpKey ),
				'fetchpriority' => 'high',
				'data-wpbs'     => '',
			];

			// Add breakpoint/resolution attribute for images
			if ( $type === 'image' ) {
				$attrs["data-{$bpKey}"] = esc_url( $src );
			}

			// Output <link>
			$html = '<link ';
			foreach ( $attrs as $key => $value ) {
				$html .= $key . '="' . esc_attr( $value ) . '" ';
			}
			$html .= '/>';

			WPBS::console_log( [ $html ] );
			echo $html . "\n";
		}
	}


	private function resolve_video_url( int $id ): ?string {
		// Example: use wp_get_attachment_url() for video attachments
		$url = wp_get_attachment_url( $id );

		return $url ?: null;
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

		$props_filtered = function ( $props = [] ) {

			// FEATURED IMAGE (desktop)
			if ( isset( $props['--featured-image'] ) ) {

				unset( $props['--featured-image'] );

				$post_id = get_the_ID();
				if ( $post_id ) {

					$featured_url = get_the_post_thumbnail_url( $post_id, 'full' );

					if ( $featured_url ) {
						$props['--image'] = sprintf(
							'image-set(url("%s.webp") type("image/webp"), url("%s") type("image/jpeg"))',
							esc_url( $featured_url ),
							esc_url( $featured_url )
						);
					}
				}
			}

			// FEATURED IMAGE MOBILE (mobile)
			if ( isset( $props['--featured-image-mobile'] ) ) {

				unset( $props['--featured-image-mobile'] );

				// ACF mobile featured image
				$mobile_id = get_field( 'page_settings_media_mobile_image', get_the_ID() );

				if ( $mobile_id ) {
					$mobile_url = wp_get_attachment_image_url( $mobile_id, 'full' );

					if ( $mobile_url ) {
						$props['--image'] = sprintf(
							'image-set(url("%s.webp") type("image/webp"), url("%s") type("image/jpeg"))',
							esc_url( $mobile_url ),
							esc_url( $mobile_url )
						);
					}
				}
			}

			return $props;
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

			$bg_props = $props_filtered( $parsed_css['background'] );

			$bg_selector = "{$selector} > .wpbs-background";
			$bg_css      .= "{$bg_selector} { " . $props_to_css( $bg_props ) . " } ";
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

					$bp_bg_props = $props_filtered( $bp_props['background'] );

					$bg_selector = "{$selector} > .wpbs-background";
					$bp_css      .= "{$bg_selector} { " . $props_to_css( $bp_bg_props, true ) . " } ";
				}

				if ( $bp_css ) {
					$css .= "@media (max-width: {$max_width}px) { {$bp_css} } ";
				}
			}
		}

		$final_css = trim( $bg_css . ' ' . $css );

		return $final_css ?: '';
	}

	private function push_critical_css( string $css ): void {
		add_filter( 'wpbs_critical_css', function ( $list ) use ( $css ) {
			$list[] = $css;

			return $list;
		} );
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
					'type'         => 'object',
					'show_in_rest' => true,
				],
				'wpbs-preload' => [
					'type'         => 'array',
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

	private function resolve_image_url( $id, $resolution = 'large' ): ?string {
		$src = wp_get_attachment_image_url( $id, $resolution );

		if ( ! $src ) {
			return null;
		}

		// webp always preferred
		$webp = $src . '.webp';

		// If the WebP exists on disk
		$path = str_replace( home_url(), ABSPATH, $webp );

		/*if ( file_exists( $path ) ) {
			return $webp;
		}*/

		return $webp;

		//return $src;
	}


	/* Instance */

	public static function init(): WPBS_Blocks {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Blocks();
		}

		return self::$instance;
	}

}


