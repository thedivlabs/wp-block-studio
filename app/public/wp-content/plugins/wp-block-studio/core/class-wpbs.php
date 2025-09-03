<?php

if ( class_exists( 'WPBS' ) ) {
	return false;
}

class WPBS {

	private static WPBS $instance;

	public static string $path;
	public static string $uri;
	public static string $nonce;
	public static string $nonce_rest;
	public static string $transient_base;

	private function __construct( $path ) {

		self::$transient_base = 'wpbs';
		self::$path           = $path;
		self::$uri            = plugins_url( '/wp-block-studio/' );

		add_action( 'init', function () {
			register_block_style(
				'gravityforms/form',
				array(
					'name'  => 'dark',
					'label' => 'Dark',
				)
			);
		} );

		add_action( 'init', [ $this, 'theme_assets' ], 20 );
		add_action( 'enqueue_block_editor_assets', [ $this, 'editor_assets' ] );
		add_action( 'enqueue_block_assets', [ $this, 'block_assets' ] );
		add_action( 'admin_init', [ $this, 'admin_assets' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'view_assets' ] );
		add_action( 'wp_head', [ $this, 'pre_load_critical' ], 2 );
		add_action( 'wp_print_styles', [ $this, 'critical_css' ], 1 );

		add_action( 'acf/init', [ $this, 'init_theme' ], 30 );
		add_action( 'acf/init', [ $this, 'init_hook' ] );

		add_action( 'wp_after_insert_post', [ $this, 'clear_transients' ], 100 );
		add_filter( 'acf/settings/load_json', [ $this, 'load_json' ], 100 );
		add_filter( 'acf/settings/save_json', [ $this, 'save_json' ] );

		add_action( 'wp_head', [ $this, 'header_scripts' ], 110 );
		add_action( 'wp_body_open', [ $this, 'body_open_scripts' ], 1 );
		add_action( 'wp_footer', [ $this, 'footer_scripts' ], 10 );

		apply_filters( 'nonce_life', HOUR_IN_SECONDS );

		add_filter( 'wp_get_attachment_image', [ $this, 'kill_img_src' ], 300, 5 );

		add_action( 'rest_api_init', [ $this, 'lightbox_endpoint' ] );
		add_action( 'rest_api_init', [ $this, 'grid_endpoint' ] );

		add_filter( 'intermediate_image_sizes', [ $this, 'remove_default_image_sizes' ], 30 );

		add_filter( 'style_loader_tag', function ( $html, $handle, $href ) {

			if ( is_admin() || in_array( $GLOBALS['pagenow'] ?? false, [ 'wp-login.php', 'wp-register.php' ], true ) ) {
				return $html;
			}

			if ( str_contains( $handle, 'wpbs' ) ) {
				$href_no_query = wp_parse_url( $href, PHP_URL_PATH );

				$path = ABSPATH . ltrim( $href_no_query, '/' );

				if ( file_exists( $path ) ) {
					$css = file_get_contents( $path );

					return '<style id="' . esc_attr( $handle ) . '">' . $css . '</style>';
				}
			} else {
				$html = str_replace( 'href=', 'data-href=', $html );
			}

			return $html;
		}, 100, 3 );

	}

	public function remove_default_image_sizes( $sizes ): array {

		foreach ( $sizes as $k => $size ) {

			if ( ! in_array( $size, [ 'thumbnail', 'mobile', 'small', 'medium', 'large', 'xlarge' ] ) ) {
				unset( $sizes[ $k ] );
			}
		}

		return $sizes;
	}


	public function kill_img_src( $html, $attachment_id, $size, $icon, $attr ): string {

		if ( is_admin() ) {
			return $html;
		}

		if ( ( $attr['loading'] ?? false ) == 'eager' ) {
			return $html;
		}

		return str_replace( [ 'src=', 'srcset=' ], [ 'data-src=', 'data-srcset=' ], $html );
	}

	public function critical_css(): void {

		global $wp_styles;

		$theme_css      = $wp_styles->registered['wpbs-theme-css']->src ?? '';
		$theme_css_path = ABSPATH . ltrim( str_replace( home_url(), '', $theme_css ), '/' );

		$wp_styles->dequeue( 'wpbs-theme-css' );
		$wp_styles->remove( 'wpbs-theme-css' );

		$css = apply_filters( 'wpbs_critical_css', [] );

		$css = array_unique( $css );

		echo '<style class="wpbs-critical-css">';
		echo join( ' ', array_values( $css ) );
		echo file_get_contents( $theme_css_path );
		echo '</style>';

	}

	public function theme_assets(): void {

		/*wp_register_script( 'wpbs-fontawesome', 'https://kit.fontawesome.com/bff7e13981.js', [], false, [
			'strategy'  => 'async',
			'in_footer' => false,
		] );*/

		/* Odometer */
		wp_register_style( 'odometer-css', 'https://cdnjs.cloudflare.com/ajax/libs/odometer.js/0.4.8/themes/odometer-theme-default.min.css', [], false );
		wp_register_script( 'odometer-js', 'https://cdnjs.cloudflare.com/ajax/libs/odometer.js/0.4.8/odometer.min.js', [], false, [
			'strategy' => 'async'
		] );

		$icon_names = 'circle,account_box,account_circle,add,add_box,add_circle,alarm,album,analytics,api,archive,arrow_back,arrow_drop_down,arrow_drop_up,arrow_forward,art_track,assessment,attach_file,attach_file_off,attach_money,auto_fix_high,auto_fix_normal,auto_fix_off,bar_chart,battery_charging_full,battery_full,bedtime,block,bluetooth,bookmark,bookmark_border,brightness_5,brightness_6,brightness_7,brush,bug_report,build,cafe,calendar_today,camera,camera_alt,camera_roll,cancel,cast,chat,check,close,cloud,cloud_download,cloud_upload,code,coffee,construction,content_copy,content_cut,content_paste,credit_card,data_usage,delete,description,desktop_windows,directions_bike,directions_bus,directions_car,directions_walk,donut_large,drag_indicator,edit,edit_note,email,emoji_events,error,expand_less,expand_more,extension,fast_forward,fast_rewind,fastfood,favorite,fiber_manual_record,fiber_new,fiber_smart_record,file_download,file_upload,filter_list,fingerprint,first_page,fitness_center,flash_off,flash_on,flight,folder,folder_open,format_align_center,format_align_left,format_align_right,format_bold,format_italic,format_list_bulleted,format_list_numbered,format_underline,forum,fullscreen,fullscreen_exit,gamepad,gavel,gpp_bad,gpp_good,graphic_eq,group,groups,headphones,headset,headset_mic,help,help_outline,home,image,info,joystick,keyboard,keyboard_arrow_down,keyboard_arrow_left,keyboard_arrow_right,keyboard_arrow_up,language,laptop,last_page,lightbulb,line_chart,link,local_bar,local_cafe,local_grocery_store,local_hospital,local_pizza,local_shipping,location_on,lock,loop,loyalty,lunch_dining,manage_accounts,map,menu,mic,mic_none,mode_comment,money,more_horiz,more_vert,mouse,movie,navigate_before,navigate_next,nightlight,notifications,palette,pause,pause_circle,payments,person,phone,phonelink,photo,photo_camera,pie_chart,play_arrow,play_circle,playlist_add,playlist_play,policy,post_add,present_to_all,print,public,push_pin,question_mark,redo,refresh,remove,remove_circle,remove_circle_outline,restaurant,rocket_launch,router,scanner,schedule,school,search,security,send,settings,share,shield,shopping_bag,shopping_basket,shopping_cart,shopping_cart_checkout,show_chart,skip_next,skip_previous,sort,speaker,sports_esports,star,star_half,sticky_note_2,stop,stop_circle,store,storefront,subway,support,support_agent,swap_horiz,swap_vert,sync,sync_alt,tablet,terminal,text_snippet,thermostat,thumb_down,thumb_up,timer,train,translate,trending_down,trending_flat,trending_up,tv,unarchive,undo,video_camera_front,videocam,visibility,visibility_off,volume_down,volume_mute,volume_up,vpn_key,wb_sunny,webhook,widgets,wifi,work,zoom_in,zoom_out';
		$icon_names = explode( ',', $icon_names );
		$icon_names = array_merge( [], $icon_names, explode( ',', str_replace( [ ' ' ], [ '' ], get_field( 'theme_settings_api_material_icons', 'options' ) ?: '' ) ) ?: [] );
		sort( $icon_names );
		$icon_names = '&icon_names=' . implode( ',', $icon_names );

		wp_register_style( 'google-material-icons', 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block' . $icon_names, [], false );

		/* Swiper */
		wp_register_style( 'swiper-css', 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css' );
		wp_register_script( 'swiper-js', 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js', [], false, [
			'strategy' => 'async'
		] );

		/* Masonry */
		wp_register_script( 'wpbs-masonry-js', 'https://unpkg.com/masonry-layout@4/dist/masonry.pkgd.min.js', [], false, [
			'strategy'  => 'async',
			'in_footer' => false,
		] );

		wp_register_style( 'wpbs-theme-css', self::$uri . 'build/theme.css', [], '1.5' );
		wp_register_style( 'wpbs-admin-css', self::$uri . 'build/admin.css' );
		wp_register_script( 'wpbs-theme-js', self::$uri . 'build/theme.js', [
			'wp-dom-ready',
		], false, [
			'strategy'  => 'async',
			'in_footer' => false,
		] );
		wp_register_script( 'wpbs-admin-js', self::$uri . 'build/admin.js', [
			'wp-dom-ready',
		], false, [
			'strategy'  => 'defer',
			'in_footer' => true,
		] );


		wp_localize_script( 'wpbs-theme-js', 'wpbsData', apply_filters( 'wpbs_init_vars', [
			'path'        => [
				'site'  => home_url(),
				'ajax'  => admin_url( 'admin-ajax.php' ),
				'theme' => get_theme_file_uri()
			],
			'nonce'       => self::$nonce,
			'nonce_rest'  => self::$nonce_rest,
			'breakpoints' => wp_get_global_settings()['custom']['breakpoints'] ?? [],
			'containers'  => wp_get_global_settings()['custom']['container'] ?? [],
		], false ) );

	}

	public function block_assets(): void {

		wp_enqueue_script( 'wpbs-masonry-js' );
		wp_enqueue_script( 'wpbs-theme-js' );
		wp_enqueue_style( 'google-material-icons' );
		//wp_enqueue_script( 'wpbs-admin-js' );

	}

	public function admin_assets(): void {
		wp_enqueue_style( 'wpbs-admin-css' );
		wp_enqueue_script( 'wpbs-admin-js' );
		wp_enqueue_style( 'google-material-icons' );
	}

	public function editor_assets(): void {
		wp_enqueue_style( 'wpbs-theme-css' );
		wp_enqueue_style( 'wpbs-admin-css' );
		wp_enqueue_script( 'wpbs-admin-js' );
		wp_enqueue_style( 'google-material-icons' );
		wp_enqueue_script( 'wpbs-swiper-js' );
		wp_enqueue_style( 'wpbs-swiper-css' );
	}

	public function view_assets(): void {
		wp_enqueue_style( 'google-material-icons' );
		wp_enqueue_script( 'wpbs-masonry-js' );
		wp_enqueue_script( 'wpbs-theme-js' );
	}

	public function init_theme(): void {

		$this->set_nonce();

		if ( isset( $_GET['wpbs-cache'] ) && current_user_can( 'manage_options' ) ) {
			self::clear_transients();
		}

		$core_path = self::$path . 'core/';

		require_once $core_path . 'modules/class-wpbs-wp.php';
		require_once $core_path . 'modules/class-wpbs-acf.php';
		require_once $core_path . 'modules/class-wpbs-blocks.php';
		require_once $core_path . 'modules/class-wpbs-cpt.php';
		require_once $core_path . 'modules/class-wpbs-taxonomy.php';
		require_once $core_path . 'modules/class-wpbs-popup.php';
		require_once $core_path . 'modules/class-wpbs-media-gallery.php';
		require_once $core_path . 'modules/class-wpbs-company.php';
		require_once $core_path . 'modules/class-wpbs-google-places.php';
		require_once $core_path . 'modules/class-wpbs-gravity-forms.php';
		require_once $core_path . 'modules/class-wpbs-review.php';
		require_once $core_path . 'modules/class-wpbs-service.php';
		require_once $core_path . 'modules/class-wpbs-faq.php';
		require_once $core_path . 'modules/class-wpbs-team.php';
		require_once $core_path . 'modules/class-wpbs-features.php';
		require_once $core_path . 'modules/class-wpbs-case-study.php';
		require_once $core_path . 'modules/class-wpbs-shortcodes.php';

		WPBS_WP::init();
		WPBS_ACF::init();
		WPBS_Blocks::init();
		WPBS_Popup::init();
		WPBS_Media_Gallery::init();
		WPBS_Company::init();
		WPBS_Google_Places::init();
		WPBS_Gravity_Forms::init();
		WPBS_Review::init();
		WPBS_Service::init();
		WPBS_FAQ::init();
		WPBS_Team::init();
		WPBS_Features::init();
		WPBS_Case_Study::init();
		WPBS_Shortcodes::init();

		self::init_classes( 'core/components' );

		do_action( 'wpbs_init' );
	}

	public function init_hook(): void {

		do_action( 'wpbs' );
	}

	public function save_json( $path ): string {

		if (
			! is_admin()
		) {
			return $path;
		}
		$save_path = self::$path . 'acf-json';
		if ( file_exists( $save_path ) ) {
			return $save_path;
		} else {
			return $path;
		}
	}

	public function load_json( $paths ): string|array {

		if ( ! is_admin() ) {
			return $paths;
		}


		return array_merge( self::get_acf_load_paths(), $paths );

	}

	static function get_acf_load_paths(): array {

		$acf_json_paths = array_unique( array_merge(
			glob( self::$path . 'acf-json', GLOB_ONLYDIR ),
			glob( self::$path . 'core/acf-json', GLOB_ONLYDIR ),
			glob( self::$path . 'features/**/acf-json', GLOB_ONLYDIR ),
		) );

		return array_merge( $acf_json_paths, [
			//get_stylesheet_directory() . '/acf-json',
		] );

	}

	public static function clear_transients(): void {


		global $wpdb;

		$query = wp_list_pluck( $wpdb->get_results(
			"SELECT option_name AS name, option_value AS value FROM $wpdb->options WHERE option_name LIKE '_transient_%'"
		), 'name' );

		foreach ( $query as $name ) {

			if ( str_contains( $name, '_wpbs_' ) ) {
				delete_transient( substr( $name, strpos( $name, 'wpbs_' ) ) );
			}
		}

	}

	public static function get_transient( $field_id, $slug = null, $post_id = null ): mixed {

		$name = self::transient_name( $slug, $field_id, $post_id );

		$data = get_transient( $name );

		if ( empty( $data ) ) {

			$data = get_field( $field_id, $post_id ?? false );

			if ( is_array( $data ) ) {
				$data = WPBS::clean_array( $data );
			}

			if ( is_string( $data ) ) {
				$data = trim( $data );
			}

			if ( ! empty( $data ) ) {
				set_transient( $name, $data, DAY_IN_SECONDS );
			}

		}

		return $data;

	}

	public static function transient_name( $field_id = null, $slug = null, $post_id = null ): string {
		if ( empty( $field_id ) ) {
			return self::$transient_base;
		}

		return implode( '_', array_filter( [
			self::$transient_base,
			$slug,
			$field_id,
			$post_id
		] ) );
	}

	public function set_nonce(): void {
		self::$nonce      = wp_create_nonce( 'wpbs_page_id' );
		self::$nonce_rest = wp_create_nonce( 'wp_rest' );
	}

	public static function init( $path ): WPBS {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS( $path );
		}

		return self::$instance;
	}

	public static function console_log( $var = [], $label = false ): void {

		$result = is_array( $var ) || is_object( $var ) ? json_encode( $var ) : '"' . $var . '"';

		if ( ! empty( $label ) ) {
			$result .= ' , "' . $label . '"';
		}

		add_action( 'wp_footer', function () use ( $result ) {
			echo "<script>";
			echo "console.log($result)";
			echo "</script>";
		}, 900 );
		add_action( 'admin_footer', function () use ( $result ) {
			echo "<script>";
			echo "console.log($result)";
			echo "</script>";
		}, 900 );
		add_action( 'login_footer', function () use ( $result ) {
			echo "<script>";
			echo "console.log($result)";
			echo "</script>";
		}, 900 );


	}

	public function pre_load_critical(): void {

		global $wp_scripts;

		$theme_fonts = array_values( array_unique( array_merge( [], ...wp_list_pluck( array_merge( [], ...( array_column( ( wp_get_global_settings()['typography']['fontFamilies']['theme'] ?? [] ), 'fontFace' ) ?: [] ) ), 'src' ) ) ) );
		$theme_uri   = get_template_directory_uri();

		foreach ( $theme_fonts as $src ) {
			if ( str_starts_with( $src, 'file:' ) ) {
				$relative_path = substr( $src, 5 );
				$url           = $theme_uri . '/' . ltrim( $relative_path, '/' );
				echo '<link rel="preload" href="' . esc_url( $url ) . '" as="font" type="font/woff2" crossorigin>' . "\n";
			}
		}

		$preconnect_sources = [ 'fonts.gstatic.com', ...apply_filters( 'wpbs_preconnect_sources', [] ) ];
		$preload_sources    = apply_filters( 'wpbs_preload_sources', [] );
		$preload_images     = apply_filters( 'wpbs_preload_images', [] );

		foreach ( array_unique( array_filter( $preconnect_sources ) ) as $src ) {
			$url = parse_url( $src );
			if ( ! empty( $url['host'] ) ) {
				echo '<link rel="preconnect" href="https://' . $url['host'] . '">';
			}
		}

		foreach ( array_unique( array_filter( $preload_sources ) ) as $src ) {
			$url = parse_url( $src );

			if ( ! empty( $url['host'] ) ) {
				echo '<link rel="preconnect" href="https://' . $url['host'] . '">';
				echo '<link rel="preload" href="' . $src . '">';
			}
		}

		if ( ! empty( $preload_images ) ) {
			echo '<!-- Preload images -->';
		}

		foreach ( array_unique( array_keys( $preload_images ) ) as $image_id ) {

			$image_data   = $preload_images[ $image_id ];
			$src          = wp_get_attachment_image_src( $image_id, $image_data['resolution'] ?? 'large' )[0] ?? false;
			$image_srcset = wp_get_attachment_image_srcset( $image_id );
			$path         = str_replace( home_url(), ABSPATH, $src );
			$webp         = ! str_contains( $path, '.svg' );
			$breakpoints  = wp_get_global_settings()['custom']['breakpoints'] ?? [];
			$operator     = ! empty( $image_data['mobile'] ) ? '<' : '>=';

			echo '<link rel="preload" as="image" data-preload-id="' . $image_id . '"';

			echo 'href="' . ( $src . ( $webp ? '.webp' : '' ) ) . '"';

			if ( ! empty( $image_data['breakpoint'] ) ) {
				echo 'media="(width ' . $operator . ' ' . ( $breakpoints[ $image_data['breakpoint'] ] ?? '992px' ) . ')"';
			}


			if ( $image_srcset ) {
				echo 'imagesrcset="' . ( ! $webp ? $image_srcset : str_replace( [
						'.jpg',
						'.png',
						'.jpeg'
					], [ '.jpg.webp', '.png.webp', '.jpeg.webp' ], $image_srcset ) ) . '"';
			}

			echo 'type="image/webp"';

			echo '/>';

		}

		$default_scripts = [
			'jquery-core',
			'jquery',
			'jquery-migrate',
		];

		$preload_scripts = array_values( array_filter( array_map( function ( $slug ) use ( $wp_scripts, $default_scripts ) {
			return in_array( $slug, $default_scripts ) ? $wp_scripts->registered[ $slug ]->src ?? '' : [];
		}, $wp_scripts->queue ?? [] ) ) );

		foreach ( array_unique( array_filter( apply_filters( 'wpbs_preload_scripts', $preload_scripts ) ) ) as $url ) {
			echo '<link rel="preload" as="script" href="' . $url . '">';
		}

	}

	public static function clean_array( $array, &$ref_array = [] ): mixed {
		$array = ! empty( $array ) ? $array : $ref_array;

		if ( ! is_array( $array ) ) {
			return $array;
		}

		foreach ( $array as $key => &$value ) {
			if ( is_array( $value ) ) {
				$value = self::clean_array( $value );
			}
			if (
				empty( $value ) ||
				( $key === '' )
			) {
				unset( $array[ $key ] );
			}
		}

		return $array;
	}

	public static function get_block_template( $block ): array {

		if ( ! is_array( $block ) || empty( $block['blockName'] ) ) {
			return [];
		}

		$block = self::sanitize_block_template( $block );

		$template = [
			'blockName'    => $block['blockName'],
			'attrs'        => $block['attrs'] ?? [],
			'innerBlocks'  => [],
			'innerContent' => [],
			'innerHTML'    => ''
		];

		if ( isset( $block['context'] ) ) {
			$template['context'] = $block['context'];
		}
		if ( isset( $block['innerContent'] ) ) {
			$template['innerContent'] = $block['innerContent'];
		}

		if ( ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
			foreach ( $block['innerBlocks'] as $inner_block ) {
				$child = self::get_block_template( $inner_block );
				if ( $child ) {
					$template['innerBlocks'][] = $child;
				}
			}
		}

		return $template;
	}

	public static function init_classes( $dir, $init = true ): void {

		$path = self::$path;

		$files = array_map( function ( $file_path ) {

			$file_name  = substr( $file_path, strrpos( $file_path, '/' ) + 1 );
			$class_name = str_replace( [ 'class-', '-', '.php' ], [
				'',
				'_',
				''
			], $file_name );

			return [
				'file'  => $file_name,
				'class' => $class_name,
				'path'  => $file_path
			];

		}, array_merge(
			glob( $path . $dir . '/class-*.php' ),
			glob( $path . $dir . '/**/class-*.php' ),
		) );

		usort( $files, function ( $a, $b ) {
			return strcmp( $a['path'], $b['path'] );
		} );

		foreach ( $files as $file ) {
			$slug = trim( str_replace( [ 'class-wpbs-', '.php' ], [ '' ], $file['file'] ) );
			require $file['path'];
		}

		foreach ( $files as $file ) {

			if (
				$init &&
				class_exists( $file['class'] ) &&
				method_exists( $file['class'], 'init' )
			) {
				call_user_func( [ $file['class'], 'init' ] );
			}
		}


	}

	public static function sanitize_block_template( $block, &$counter = 0, $max_blocks = 30 ): array {
		if ( ++ $counter > $max_blocks ) {
			return [];
		}

		return [
			'blockName'    => $block['blockName'] ?? '',
			'attrs'        => array_map( [ __CLASS__, 'recursive_sanitize' ], $block['attrs'] ?? [] ),
			'innerBlocks'  => array_map( function ( $b ) use ( &$counter, $max_blocks ) {
				return self::sanitize_block_template( $b, $counter, $max_blocks );
			}, $block['innerBlocks'] ?? [] ),
			'innerHTML'    => wp_kses_post( $block['innerHTML'] ?? '' ),          // Allow safe HTML
			'innerContent' => array_map( function ( $item ) {
				return is_string( $item ) ? wp_kses_post( $item ) : null;          // Allow safe HTML
			}, $block['innerContent'] ?? [] ),
		];
	}

	public static function recursive_sanitize( $input ) {
		if ( is_array( $input ) ) {
			$sanitized = [];

			foreach ( $input as $key => $value ) {
				$sanitized_key               = is_string( $key ) ? sanitize_text_field( $key ) : $key;
				$sanitized[ $sanitized_key ] = self::recursive_sanitize( $value );
			}

			return $sanitized;

		} elseif ( is_string( $input ) ) {
			return sanitize_text_field( $input );

		} elseif ( is_int( $input ) ) {
			return intval( $input );

		} elseif ( is_float( $input ) ) {
			return floatval( $input );

		} elseif ( is_bool( $input ) ) {
			return (bool) $input;

		} elseif ( is_null( $input ) ) {
			return null;

		} else {
			return $input;
		}
	}

	public static function picture( $mobile_id = false, $large_id = false, $breakpoint = 'normal', $resolution = 'large', $loading = 'lazy' ): string|bool {

		$breakpoints = wp_get_global_settings()['custom']['breakpoints'] ?? [];
		$bp          = $breakpoints[ $breakpoint ] ?? '768px';

		$mobile_src = wp_get_attachment_image_src( $mobile_id ?: $large_id, $resolution )[0] ?? false;
		$large_src  = wp_get_attachment_image_src( $large_id ?: $mobile_id, $resolution )[0] ?? false;

		$result = '<picture>';

		$is_lazy     = $loading !== 'eager';
		$srcset_attr = $is_lazy ? 'data-srcset' : 'srcset';

		if ( $large_id ) {
			$result .= '<source ' . $srcset_attr . '="' . esc_url( $large_src . '.webp' ) . '" type="image/webp" media="(min-width:' . esc_attr( $bp ) . ')">';
		}
		if ( $large_id ) {
			$result .= '<source ' . $srcset_attr . '="' . esc_url( $large_src ) . '" media="(min-width:' . esc_attr( $bp ) . ')">';
		}

		if ( $mobile_id ) {
			$result .= '<source ' . $srcset_attr . '="' . esc_url( $mobile_src . '.webp' ) . '" type="image/webp" media="(min-width:0px)">';
		}
		if ( $mobile_id ) {
			$result .= '<source ' . $srcset_attr . '="' . esc_url( $mobile_src ) . '" media="(min-width:0px)">';
		}

		$result .= wp_get_attachment_image(
			$large_id ?: $mobile_id,
			$resolution,
			false,
			[
				'loading' => $loading,
				'class'   => 'w-full h-full object-cover'
			]
		);

		$result .= '</picture>';

		return $result;
	}

	public static function youtube_image( $share_link = '', $args = [] ): string|bool {

		if ( ! is_string( $share_link ) || empty( $share_link ) ) {
			return false;
		}

		$pattern = '/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/';

		$video_id = preg_match( $pattern, $share_link, $matches ) ? $matches[1] : false;

		if ( empty( $video_id ) ) {
			return false;
		}

		if ( ! empty( $args['id_only'] ) ) {
			return $video_id;
		}

		$class = $args['class'] ?? 'w-full h-full z-0 relative object-cover object-center';

		return '<img src="https://i3.ytimg.com/vi/' . $video_id . '/hqdefault.jpg" class="' . $class . '" alt="" loading="' . ( $args['loading'] ?? 'lazy' ) . '" />';

	}

	public function body_open_scripts(): void {

		$analytics_id = trim( self::get_transient( 'theme_settings_api_google_analytics_id', 'theme_settings', 'option' ) ?: '' );

		if ( ! empty( $analytics_id ) ) {
			get_template_part( 'core/parts/site/google', 'analytics', [
				'id' => $analytics_id
			] );
		}

	}

	public function header_scripts(): void {

		$analytics_id = trim( self::get_transient( 'theme_settings_api_google_analytics_id', 'theme_settings', 'option' ) ?: '' );

		if ( ! empty( $analytics_id ) ) {
			get_template_part( 'core/parts/google', 'analytics', [
				'id'   => $analytics_id,
				'head' => true
			] );
		}

		$scripts = array_merge(
			array_filter( get_field( 'theme_settings', 'option' )['scripts'] ?? false ?: [], function ( $script ) {
				return ! empty( $script['in_header'] ) && ! empty( $script['enabled'] ) && ! in_array( get_the_ID(), (array) ( $script['suppress'] ?? [] ) );
			}, ARRAY_FILTER_USE_BOTH ),
			array_filter( get_field( 'page_settings', get_the_ID() )['scripts'] ?? false ?: [], function ( $script ) {
				return ! empty( $script['in_header'] ) && ! empty( $script['enabled'] ) && ! in_array( get_the_ID(), (array) ( $script['suppress'] ?? [] ) );
			}, ARRAY_FILTER_USE_BOTH ),

		);

		if ( ! empty( $scripts ) ) {
			echo "<!-- Header Scripts -->\r\n";

			foreach ( $scripts as $script ) {
				echo $script['script'] ?? false;
			}
		}

	}

	public function footer_scripts(): void {

		$scripts = array_merge(
			array_filter( get_field( 'theme_settings', 'option' )['scripts'] ?? false ?: [], function ( $script ) {
				return empty( $script['in_header'] ) && ! empty( $script['enabled'] ) && ! in_array( get_the_ID(), (array) ( $script['suppress'] ?? [] ) );
			}, ARRAY_FILTER_USE_BOTH ),
			array_filter( get_field( 'page_settings', get_the_ID() )['scripts'] ?? false ?: [], function ( $script ) {
				return empty( $script['in_header'] ) && ! empty( $script['enabled'] ) && ! in_array( get_the_ID(), (array) ( $script['suppress'] ?? [] ) );
			}, ARRAY_FILTER_USE_BOTH ),
		);

		if ( ! empty( $scripts ) ) {

			echo "<!-- Footer Scripts -->\r\n";

			foreach ( $scripts as $script ) {
				echo $script['script'] ?? false;
			}
		}

	}

	public function render_lightbox( WP_REST_Request $request ): WP_REST_Response {

		$media = $request->get_param( 'media' );

		$response_data = array(
			'success'  => true,
			'rendered' => ( new WP_Block( [
				'blockName' => 'wpbs/lightbox',
				'attrs'     => [
					'media' => $media,
				]
			] ) )->render(),
		);

		return new WP_REST_Response( $response_data, 200 );
	}

	public function lightbox_endpoint(): void {
		register_rest_route( 'wpbs/v1', '/lightbox', array(
			'methods'             => 'POST',
			'callback'            => [ $this, 'render_lightbox' ],
			'permission_callback' => '__return_true',
			'args'                => array(
				'uniqueId'     => array(
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => function ( $param, $request, $key ) {
						// Basic validation: check if it's not empty
						return ! empty( $param );
					},
				),
				'blockContext' => array(
					'type' => 'object',
				)
			),
		) );
	}

	public function render_grid( WP_REST_Request $request ): WP_REST_Response {

		$uniqueId = $request->get_param( 'uniqueId' );
		$context  = $request->get_param( 'context' );

		$response_data = array(
			'success'  => true,
			'rendered' => ( new WP_Block( [
				'blockName' => 'wpbs/layout-grid-container',
				'attrs'     => [
					'uniqueId' => $uniqueId,
					'context'  => $context,
				]
			] ) )->render(),
		);

		return new WP_REST_Response( $response_data, 200 );
	}

	public function grid_endpoint(): void {
		register_rest_route( 'wpbs/v1', '/layout-grid', array(
			'methods'             => 'POST',
			'callback'            => [ $this, 'render_grid' ],
			'permission_callback' => '__return_true',
			'args'                => array(
				'uniqueId'     => array(
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => function ( $param, $request, $key ) {
						// Basic validation: check if it's not empty
						return ! empty( $param );
					},
				),
				'blockContext' => array(
					'type' => 'object',
				)
			),
		) );
	}

}

