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

			add_filter( 'render_block_data', [ $this, 'handle_block_icons' ], 10, 2 );
		}


		add_action( 'wp_head', [ $this, 'output_page_icons' ], 40 );
		add_action( 'admin_head', [ $this, 'output_page_icons' ], 40 );

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


	/* Icons */

	private function build_icons_url( array $names ): ?string {

		$names = array_values( array_unique( array_filter( $names ) ) );

		if ( empty( $names ) ) {
			return null;
		}

		sort( $names, SORT_STRING );

		return sprintf(
			'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,200..500,0..1,0&icon_names=%s&display=swap',
			implode( ',', $names )
		);
	}

	private function get_default_icon_safelist(): array {

		$raw = 'keyboard_arrow_down,keyboard_arrow_up,circle,account_box,account_circle,add,add_box,add_circle,alarm,album,analytics,api,archive,arrow_back,arrow_drop_down,arrow_drop_up,arrow_forward,art_track,assessment,attach_file,attach_file_off,attach_money,auto_fix_high,auto_fix_normal,auto_fix_off,bar_chart,battery_charging_full,battery_full,bedtime,block,bluetooth,bookmark,bookmark_border,brightness_5,brightness_6,brightness_7,brush,bug_report,build,cafe,calendar_today,camera,camera_alt,camera_roll,cancel,cast,chat,check,close,cloud,cloud_download,cloud_upload,code,coffee,construction,content_copy,content_cut,content_paste,credit_card,data_usage,delete,description,desktop_windows,directions_bike,directions_bus,directions_car,directions_walk,donut_large,drag_indicator,edit,edit_note,email,emoji_events,error,expand_less,expand_more,extension,fast_forward,fast_rewind,fastfood,favorite,fiber_manual_record,fiber_new,fiber_smart_record,file_download,file_upload,filter_list,fingerprint,first_page,fitness_center,flash_off,flash_on,flight,folder,folder_open,format_align_center,format_align_left,format_align_right,format_bold,format_italic,format_list_bulleted,format_list_numbered,format_underline,forum,fullscreen,fullscreen_exit,gamepad,gavel,gpp_bad,gpp_good,graphic_eq,group,groups,headphones,headset,headset_mic,help,help_outline,home,image,info,joystick,keyboard,keyboard_arrow_down,keyboard_arrow_left,keyboard_arrow_right,keyboard_arrow_up,language,laptop,last_page,lightbulb,line_chart,link,local_bar,local_cafe,local_grocery_store,local_hospital,local_pizza,local_shipping,location_on,lock,loop,loyalty,lunch_dining,manage_accounts,map,menu,mic,mic_none,mode_comment,money,more_horiz,more_vert,mouse,movie,navigate_before,navigate_next,nightlight,notifications,palette,pause,pause_circle,payments,person,phone,phonelink,photo,photo_camera,pie_chart,play_arrow,play_circle,playlist_add,playlist_play,policy,post_add,present_to_all,print,public,push_pin,question_mark,redo,refresh,remove,remove_circle,remove_circle_outline,restaurant,rocket_launch,router,scanner,schedule,school,search,security,send,settings,share,shield,shopping_bag,shopping_basket,shopping_cart,shopping_cart_checkout,show_chart,skip_next,skip_previous,sort,speaker,sports_esports,star,star_half,sticky_note_2,stop,stop_circle,store,storefront,subway,support,support_agent,swap_horiz,swap_vert,sync,sync_alt,tablet,terminal,text_snippet,thermostat,thumb_down,thumb_up,timer,train,translate,trending_down,trending_flat,trending_up,tv,unarchive,undo,video_camera_front,videocam,visibility,visibility_off,volume_down,volume_mute,volume_up,vpn_key,wb_sunny,webhook,widgets,wifi,work,zoom_in,zoom_out';

		$list = array_filter(
			array_map( 'trim', explode( ',', $raw ) ),
			static fn( string $n ) => $n !== ''
		);

		$list = array_unique( apply_filters( 'wpbs_icon_safelist', $list ) );

		sort( $list, SORT_STRING );

		return $list;
	}

	private function get_global_icon_names(): array {

		if ( ! empty( $_GET['wpbs-debug'] ) ) {
			delete_transient( 'wpbs_global_icon_names' );
		}

		// Check cache first
		$cached = get_transient( 'wpbs_global_icon_names' );
		if ( is_array( $cached ) ) {
			return $cached;
		}

		if ( ! function_exists( 'get_field' ) ) {
			return [];
		}

		$raw = get_field( 'theme_settings_api_material_icons', 'options' ) ?: '';

		if ( ! $raw ) {
			set_transient( 'wpbs_global_icon_names', [], DAY_IN_SECONDS );

			return [];
		}

		$names = array_filter(
			array_map(
				'trim',
				explode( ',', str_replace( ' ', '', $raw ) )
			),
			static fn( string $name ): bool => $name !== ''
		);

		// Deduplicate + sort
		$names = array_values( array_unique( $names ) );
		sort( $names, SORT_STRING );

		// Cache for a day (ACF save will flush)
		set_transient( 'wpbs_global_icon_names', $names, DAY_IN_SECONDS );

		return $names;
	}

	public function output_page_icons(): void {

		if ( is_feed() || is_robots() || is_trackback() ) {
			return;
		}

		// 1. Safelist stylesheet (always load)
		$safelist_url = $this->build_icons_url( $this->get_default_icon_safelist() );

		if ( $safelist_url ) {
			echo '<link rel="stylesheet" href="' . esc_url( $safelist_url ) . '">' . "\n";
		}

		// 2. Collect icons from blocks using apply_filters
		$names = apply_filters( 'wpbs_icon_names', [] );

		// Merge with global icon names
		foreach ( $this->get_global_icon_names() as $icon ) {
			if ( ! empty( $icon['name'] ) ) {
				$names[] = trim( $icon['name'] );
			}
		}

		// Remove safelist names
		$names = array_diff(
			array_filter( array_unique( array_map( 'trim', $names ) ) ),
			$this->get_default_icon_safelist()
		);

		if ( ! empty( $names ) ) {
			$page_url = $this->build_icons_url( $names );
			if ( $page_url ) {
				echo '<link rel="stylesheet" href="' . esc_url( $page_url ) . '">' . "\n";
			}
		}

		echo '<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>' . "\n";
		echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
	}


	public function handle_block_icons( array $block, array $source_block ): array {

		if ( ! str_starts_with( $block['blockName'] ?? '', 'wpbs/' ) ) {
			return $block;
		}

		// Stop collecting after wp_head begins
		if ( did_action( 'wp_head' ) ) {
			return $block;
		}

		add_filter( 'wpbs_icon_names', function ( array $carry ) use ( $block ) {

			$names = array_filter(
				wp_list_pluck( $block['attrs']['wpbs-icons'] ?? [], 'name' ),
				fn( $n ) => is_string( $n ) && $n !== ''
			);

			// merge + dedupe later
			return array_merge( $carry, $names );
		} );

		return $block;
	}


	/* Instance */

	public static function init(): WPBS_Blocks {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Blocks();
		}

		return self::$instance;
	}

}


