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
	public static array $theme_vars;

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
		add_action( 'admin_enqueue_scripts', [ $this, 'admin_assets' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'view_assets' ] );
		add_action( 'wp_head', [ $this, 'pre_load_critical' ], 2 );
		add_action( 'wp_print_styles', [ $this, 'critical_css' ], 1 );

		add_action( 'wp_head', [ $this, 'print_theme_vars' ], 3 );
		add_action( 'admin_head', [ $this, 'print_theme_vars' ], 12 );

		add_action( 'acf/init', [ $this, 'init_theme' ], 30 );
		add_action( 'acf/init', [ $this, 'init_hook' ] );

		add_action( 'wp_after_insert_post', [ $this, 'clear_transients' ], 100 );
		add_filter( 'acf/settings/load_json', [ $this, 'load_json' ], 100 );
		add_filter( 'acf/settings/save_json', [ $this, 'save_json' ] );

		add_action( 'wp_head', [ $this, 'header_scripts' ], 110 );
		add_action( 'wp_body_open', [ $this, 'body_open_scripts' ], 1 );
		add_action( 'wp_footer', [ $this, 'footer_scripts' ], 10 );

		add_action( 'admin_head', [ $this, 'inline_scripts' ], 30 );
		add_action( 'wp_head', [ $this, 'inline_scripts' ], 4 );

		add_action( 'script_loader_tag', [ $this, 'defer_scripts' ], 10, 2 );

		apply_filters( 'nonce_life', HOUR_IN_SECONDS );

		add_filter( 'wp_get_attachment_image', [ $this, 'kill_img_src' ], 300, 5 );

		add_action( 'rest_api_init', [ $this, 'lightbox_endpoint' ] );

		add_action( 'after_setup_theme', [ $this, 'register_image_sizes' ], 1 );

		if (
			function_exists( 'acf_add_options_page' )
		) {
			acf_add_options_page( array(
				'page_title' => 'Theme Settings',
				'menu_title' => 'Theme Settings',
				'menu_slug'  => 'theme-settings',
				'capability' => 'edit_posts',
				'redirect'   => false,
			) );
		}

		add_filter( 'style_loader_tag', function ( $html, $handle, $href ) {

			if (
				is_admin() ||
				in_array( $GLOBALS['pagenow'] ?? false, [ 'wp-login.php', 'wp-register.php' ], true )
			) {
				return $html;
			}

			if ( str_contains( $handle, 'wpbs' ) && ! in_array( $handle, [ 'wpbs-bundle-css' ] ) ) {

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
		}, 1, 3 );

	}

	public function print_theme_vars(): void {

		$vars = [
			'settings' => array_merge( self::$theme_vars, apply_filters( 'wpbs_init_vars', [], false ) ?? [] )
		];

		echo '<script type="text/javascript">window.WPBS = ' . json_encode( $vars ) . ';</script>';
	}

	public function defer_scripts( $tag, $handle ): string {

		if ( is_admin() ) {
			return $tag;
		}

		$dont_defer = [
			'jquery-core',
			'jquery-migrate',
			//'wp-polyfill',
			'wp-hooks',
			'wp-i18n',
			'wp-element',
			'wp-components',
			'wp-data',
			'wp-dom-ready',
			//'wp-a11y',
		];

		if ( in_array( $handle, $dont_defer, true ) || str_starts_with( $handle, 'wpbs' ) ) {
			return $tag;
		}

		if ( str_contains( $tag, ' src=' ) ) {
			return str_replace( ' src', ' defer src', $tag );
		}

		return $tag;

	}

	public function register_image_sizes(): void {

		// One canonical place for definitions.
		$custom_sizes = [
			'mobile' => [
				'label'  => __( 'Mobile' ),
				'width'  => 624,
				'height' => 900,
				'crop'   => false,
			],
			'small'  => [
				'label'  => __( 'Small' ),
				'width'  => 720,
				'height' => 1200,
				'crop'   => false,
			],
			'xlarge' => [
				'label'  => __( 'Extra Large' ),
				'width'  => 1800,
				'height' => 1800,
				'crop'   => false,
			],
		];

		// Register each size from the definitions.
		foreach ( $custom_sizes as $name => $args ) {
			add_image_size( $name, $args['width'], $args['height'], $args['crop'] );
		}

		// Limit generated image sizes.
		add_filter( 'intermediate_image_sizes_advanced', function ( $sizes ) use ( $custom_sizes ) {
			return array_intersect_key( $sizes, array_flip( array_keys( $custom_sizes ) ) );
		} );

		// Expose the names to the editor.
		add_filter( 'image_size_names_choose', function ( $sizes ) use ( $custom_sizes ) {

			$labels = [];
			foreach ( $custom_sizes as $name => $args ) {
				$labels[ $name ] = $args['label'];
			}

			return array_merge( $sizes, $labels );
		} );
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

		// Prevent interference.
		$wp_styles->dequeue( 'wpbs-theme-css' );
		$wp_styles->remove( 'wpbs-theme-css' );

		// Gather block CSS.
		$css = apply_filters( 'wpbs_critical_css', [] );
		$css = array_unique( $css );

		// Cache base Tailwind/theme CSS.
		static $base_css = null;
		if ( $base_css === null && file_exists( $theme_css_path ) ) {
			$base_css = file_get_contents( $theme_css_path );
		}

		// Minify block CSS.
		$combined = $this->minify_css( join( ' ', array_values( $css ) ) );

		// ------------------------------------------------------------
		// OUTPUT #1 — Theme/Tailwind CSS
		// ------------------------------------------------------------
		echo '<style class="wpbs-critical-css-theme">';
		echo $base_css;
		echo '</style>';

		// ------------------------------------------------------------
		// OUTPUT #2 — Block CSS
		// ------------------------------------------------------------
		echo '<style class="wpbs-critical-css-blocks">';
		echo $combined;
		echo '</style>';
	}

	private function minify_css( string $css ): string {

		// Protect url(...) values by temporarily encoding spaces
		$css = preg_replace_callback( '/url\(([^)]+)\)/', function ( $matches ) {
			return 'url(' . str_replace( ' ', '__WPBS_SPACE__', $matches[1] ) . ')';
		}, $css );

		// Remove comments
		$css = preg_replace( '/\/\*[^!*][\s\S]*?\*\//', '', $css );

		// Remove whitespace around punctuation
		$css = preg_replace( '/\s*([{};:>,])\s*/', '$1', $css );

		// Collapse multiple spaces
		$css = preg_replace( '/\s+/', ' ', $css );

		// Remove trailing semicolons
		$css = preg_replace( '/;}/', '}', $css );

		// Restore url(...) spaces
		$css = str_replace( '__WPBS_SPACE__', ' ', $css );

		return trim( $css );
	}

	public function theme_assets(): void {

		/* Theme Bundle */
		wp_register_style(
			'wpbs-bundle-css',
			self::$uri . 'build/bundle.css',
		);

		/* Odometer */
		wp_register_style( 'aos-css', 'https://unpkg.com/aos@2.3.1/dist/aos.css', [], false );
		wp_register_script( 'aos-js', 'https://unpkg.com/aos@2.3.1/dist/aos.js', [], false, [
			'strategy' => 'defer'
		] );

		/* Odometer */
		wp_register_style( 'odometer-css', 'https://cdn.jsdelivr.net/npm/odometer@0.4.8/themes/odometer-theme-default.min.css', [], false );
		wp_register_script( 'odometer-js', 'https://cdn.jsdelivr.net/npm/odometer@0.4.8/odometer.min.js', [], false, [
			'strategy' => 'defer'
		] );

		if ( file_exists( WP_PLUGIN_DIR . '/wp-block-studio/build/editor.js' ) ) {
			wp_register_script(
				'wpbs-editor',
				self::$uri . 'build/editor.js',
				[ 'wp-element', 'wp-components', 'wp-data', 'wp-block-editor', 'wp-edit-post', 'lodash' ],
				filemtime( WP_PLUGIN_DIR . '/wp-block-studio/build/editor.js' ),
				false
			);
		}


		/* Swiper */
		wp_register_style( 'swiper-css', 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css' );
		wp_register_script( 'swiper-js', 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js', [], false, [
			'strategy' => 'async'
		] );

		add_filter( 'wpbs_preconnect_sources', function ( $sources ) {
			$sources[] = 'https://cdn.jsdelivr.net';

			return $sources;
		} );

		/* Masonry */
		wp_register_script( 'masonry-js', 'https://unpkg.com/masonry-layout@4/dist/masonry.pkgd.min.js', [], false, [
			'strategy'  => 'async',
			'in_footer' => false,
		] );

		wp_register_style( 'wpbs-theme-css', self::$uri . 'build/theme.css', [], '1.5' );
		wp_register_style( 'wpbs-admin-css', self::$uri . 'build/admin.css' );
		wp_register_script( 'wpbs-theme-js', self::$uri . 'build/theme.js', [
			//'wp-dom-ready',
		], false, [
			'strategy'  => 'defer',
			'in_footer' => false,
		] );
		wp_register_script( 'wpbs-admin-js', self::$uri . 'build/admin.js', [
			'wp-dom-ready',
		], false, [
			'strategy'  => 'defer',
			'in_footer' => true,
		] );


	}

	public function block_assets(): void {


		//wp_enqueue_script( 'wpbs-theme-js' );
		//wp_enqueue_script( 'wpbs-admin-js' );
		//wp_enqueue_script( 'swiper-js' );
		//wp_enqueue_style( 'swiper-css' );
		//wp_enqueue_script( 'swiper-js' );
		//wp_enqueue_style( 'swiper-css' );

	}

	public function admin_assets(): void {
		wp_enqueue_style( 'wpbs-admin-css' );
		wp_enqueue_script( 'wpbs-admin-js' );
	}

	public function editor_assets(): void {
		wp_enqueue_style( 'wpbs-bundle-css' );
		wp_enqueue_style( 'wpbs-theme-css' );
		wp_enqueue_style( 'wpbs-admin-css' );
		wp_enqueue_script( 'wpbs-editor' );
		wp_enqueue_script( 'wpbs-theme-js' );
	}

	public function view_assets(): void {
		wp_enqueue_style( 'wpbs-bundle-css' );
		wp_enqueue_style( 'aos-css' );
		wp_enqueue_script( 'masonry-js' );
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
		require_once $core_path . 'modules/class-wpbs-icons.php';
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
		WPBS_Icons::init();
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

		self::$theme_vars = [
			'path'        => [
				'site'  => home_url(),
				'ajax'  => admin_url( 'admin-ajax.php' ),
				'theme' => get_theme_file_uri()
			],
			'nonce'       => self::$nonce,
			'nonce_rest'  => self::$nonce_rest,
			'icons'       => explode( ',', str_replace( [ ' ' ], [ '' ], (string) ( wp_get_global_settings()['custom']['icons'] ?? '' ) ) ),
			'breakpoints' => wp_get_global_settings()['custom']['breakpoints'] ?? [],
			'container'   => wp_get_global_settings()['custom']['container'] ?? [],
		];
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

// ------------------------------------------------------------
// THEME FONT PRELOADS (unchanged behavior, saner syntax)
// ------------------------------------------------------------
		$settings                = wp_get_global_settings();
		$theme_fonts_definitions = $settings['typography']['fontFamilies']['theme'] ?? [];

// Each theme font can define one or more "fontFace" entries.
// Collect all fontFace arrays from each theme font.
		$font_faces_nested = array_column( $theme_fonts_definitions, 'fontFace' ) ?: [];

// Flatten nested fontFace arrays into one flat array.
		$font_faces = array_merge( [], ...$font_faces_nested );

// Extract the "src" field from each fontFace.
// Each src can itself be an array of URLs, so we keep the nesting for now.
		$font_src_nested = wp_list_pluck( $font_faces, 'src' );

// Flatten all src arrays into one flat list of URLs, then dedupe.
		$theme_fonts = array_values(
			array_unique(
				array_merge( [], ...$font_src_nested )
			)
		);

		$theme_uri = get_template_directory_uri();

		foreach ( $theme_fonts as $src ) {
			if ( str_starts_with( $src, 'file:' ) ) {
				$relative_path = substr( $src, 5 );
				$url           = $theme_uri . '/' . ltrim( $relative_path, '/' );
				echo '<link rel="preload" href="' . esc_url( $url ) . '" as="font" type="font/woff2" crossorigin fetchpriority="high">' . "\n";
			}
		}


		// ------------------------------------------------------------
		// PRECONNECT SOURCES (unchanged)
		// ------------------------------------------------------------
		$preconnect_sources = [
			'fonts.gstatic.com',
			...apply_filters( 'wpbs_preconnect_sources', [] )
		];

		$preload_sources = apply_filters( 'wpbs_preload_sources', [] );

		foreach ( array_unique( array_filter( $preconnect_sources ) ) as $src ) {
			$url = parse_url( $src );
			if ( ! empty( $url['host'] ) ) {
				echo '<link rel="preconnect" href="https://' . $url['host'] . '" fetchpriority="high">';
			}
		}


		// ------------------------------------------------------------
		// GENERIC PRELOAD SOURCES (unchanged)
		// ------------------------------------------------------------
		foreach ( array_unique( array_filter( $preload_sources ) ) as $src ) {
			$url = parse_url( $src );

			if ( ! empty( $url['host'] ) ) {
				//echo '<link rel="preconnect" href="https://' . $url['host'] . '" fetchpriority="high">';
				echo '<link rel="preload" href="' . $src . '" fetchpriority="high">';
			}
		}


		// ------------------------------------------------------------
		// SCRIPT PRELOADS (unchanged)
		// ------------------------------------------------------------
		$default_scripts = [
			//'jquery-core',
			//'jquery',
			//'jquery-migrate',
		];

		$preload_scripts = array_values( array_filter(
			array_map(
				function ( $slug ) use ( $wp_scripts, $default_scripts ) {
					return in_array( $slug, $default_scripts, true )
						? $wp_scripts->registered[ $slug ]->src ?? ''
						: [];
				},
				$wp_scripts->queue ?? []
			)
		) );

		foreach ( array_unique( array_filter( apply_filters( 'wpbs_preload_scripts', $preload_scripts ) ) ) as $url ) {
			echo '<link rel="preload" as="script" href="' . $url . '" fetchpriority="high">' . "\n";
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

	public function inline_scripts(): void {
		echo '<script>';
		include_once self::$path . 'build/inline.js';
		echo '</script>';
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

}

