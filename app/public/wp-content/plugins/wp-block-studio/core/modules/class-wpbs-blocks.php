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
			add_action( 'wp_head', [ $this, 'output_page_icons' ] );
			add_filter( 'render_block_data', [ $this, 'handle_block_icons' ], 10, 2 );
			add_filter( 'render_block_data', [ $this, 'collect_preload_media' ], 10, 2 );
			add_filter( 'render_block_data', [ $this, 'handle_block_styles' ], 10, 2 );
			add_action( 'save_post', [ $this, 'flush_material_icons_cache' ], 20, 2 );

		}

	}

	public function handle_block_icons( array $block, array $source_block ): array {

		// Only process WPBS blocks
		if ( ! str_starts_with( $block['blockName'], 'wpbs' ) ) {
			return $block;
		}

		// Don't accumulate after wp_head has started or finished
		if ( did_action( 'wp_head' ) ) {
			return $block;
		}

		// Attach accumulator
		add_filter( 'wpbs_block_icons', function ( array $carry ) use ( $block ) {

			// Always start with a clean carry
			if ( ! is_array( $carry ) ) {
				$carry = [];
			}

			// Extract valid icon entries
			$icons = array_filter(
				$block['attrs']['wpbs-icons'] ?? [],
				fn( $item ) => is_array( $item ) && ! empty( $item['name'] )
			);

			// Merge into accumulator
			return array_merge( $carry, $icons );
		} );

		return $block;
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

	public function output_page_icons(): void {

		// Don't run in admin, feeds, etc.
		if ( is_admin() || is_feed() || is_robots() || is_trackback() ) {
			return;
		}

		$post_id = get_queried_object_id();
		if ( ! $post_id ) {
			return;
		}

		$cache_key = '_wpbs_material_icons_url';

		// Try cached URL first
		$cached_url = get_post_meta( $post_id, $cache_key, true );
		if ( is_string( $cached_url ) && $cached_url !== '' ) {
			echo '<link rel="stylesheet" href="' . esc_url( $cached_url ) . '" />' . "\n";

			return;
		}

		// 1. Collect icons from blocks (via your collector)
		$icons = apply_filters( 'wpbs_block_icons', [] );

		// 2. Merge in global icons from ACF (optional)
		$global_icons = $this->get_global_icon_icons();
		if ( ! empty( $global_icons ) ) {
			$icons = array_merge( $icons, $global_icons );
		}

		// 3. Build URL from collected + global icons
		$url = $this->build_material_icons_url( $icons );

		if ( ! $url ) {
			return;
		}

		// Cache per post
		update_post_meta( $post_id, $cache_key, $url );

		// Output final <link>
		echo '<link rel="stylesheet" href="' . esc_url( $url ) . '" />' . "\n";

		// Optional: preconnect to speed things up
		echo '<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />' . "\n";
		echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />' . "\n";
	}

	private function build_material_icons_url( array $icons ): ?string {

		$names  = [];
		$opsz   = [];
		$weight = [];
		$fill   = [];
		$grade  = [];

		foreach ( $icons as $icon ) {
			if ( ! is_array( $icon ) ) {
				continue;
			}

			$name = isset( $icon['name'] ) ? trim( (string) $icon['name'] ) : '';
			if ( $name === '' ) {
				continue;
			}

			// Track unique icon names
			$names[ $name ] = true;

			$opsz[]   = isset( $icon['opsz'] ) ? (int) $icon['opsz'] : 24;
			$weight[] = isset( $icon['weight'] ) ? (int) $icon['weight'] : 300;
			$fill[]   = isset( $icon['fill'] ) ? (int) $icon['fill'] : 0;
			$grade[]  = isset( $icon['grade'] ) ? (int) $icon['grade'] : 0;
		}

		if ( empty( $names ) ) {
			return null;
		}

		// Unique, sorted icon names
		$icon_names = array_keys( $names );
		sort( $icon_names );

		// Axis ranges
		$opsz_range   = $this->axis_range( $opsz, 24 );
		$weight_range = $this->axis_range( $weight, 300 );
		$fill_range   = $this->axis_range( $fill, 0 );
		$grade_range  = $this->axis_range( $grade, 0 );

		// Family (outlined to match your MaterialIcon renderer)
		$family = 'Material+Symbols+Outlined';

		// Build URL
		$url = 'https://fonts.googleapis.com/css2?family=' . $family;
		$url .= ':opsz,wght,FILL,GRAD@' . $opsz_range . ',' . $weight_range . ',' . $fill_range . ',' . $grade_range;
		$url .= '&icon_names=' . implode( ',', $icon_names );
		$url .= '&display=swap';

		return $url;
	}

	private function axis_range( array $values, int $fallback ): string {

		$values = array_filter(
			array_map( 'intval', $values ),
			static fn( int $v ): bool => $v >= 0
		);

		if ( empty( $values ) ) {
			return (string) $fallback;
		}

		sort( $values, SORT_NUMERIC );
		$values = array_values( array_unique( $values ) );

		if ( count( $values ) === 1 ) {
			return (string) $values[0];
		}

		$min = $values[0];
		$max = $values[ array_key_last( $values ) ];

		return $min . '..' . $max;
	}

	private function get_global_icon_icons(): array {

		if ( ! function_exists( 'get_field' ) ) {
			return [];
		}

		$raw = get_field( 'theme_settings_api_material_icons', 'options' ) ?: '';

		$names = array_filter(
			array_map(
				'trim',
				explode( ',', str_replace( ' ', '', $raw ) )
			),
			static fn( string $name ): bool => $name !== ''
		);

		if ( empty( $names ) ) {
			return [];
		}

		$icons = [];

		foreach ( $names as $name ) {
			$icons[] = [
				'name'   => $name,
				'fill'   => 0,
				'weight' => 300,
				'opsz'   => 24,
				'grade'  => 0,
			];
		}

		return $icons;
	}

	public function flush_material_icons_cache( int $post_id, \WP_Post $post ): void {
		if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
			return;
		}

		delete_post_meta( $post_id, '_wpbs_material_icons_url' );
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

	public static function init(): WPBS_Blocks {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Blocks();
		}

		return self::$instance;
	}

}


