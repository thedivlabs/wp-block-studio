<?php

class WPBS_Scripts {

	private static WPBS_Scripts $instance;
	public static string|bool $version;

	private function __construct() {

		add_action( 'wp_footer', [ $this, 'critical_scripts' ] );
		add_action( 'enqueue_block_assets', [ $this, 'editor_assets' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_assets' ] );
		add_action( 'wp_head', [ $this, 'custom_properties' ], 100 );
		add_action( 'admin_enqueue_scripts', [ $this, 'admin_scripts' ] );
		add_action( 'wp_head', [ $this, 'critical_css' ], 100 );
		add_action( 'wp_head', [ $this, 'header_scripts' ], 110 );
		add_action( 'wp_head', [ $this, 'pre_load_critical' ], 2 );
		add_action( 'wp_print_scripts', [ $this, 'force_scripts_footer' ], 1 );
		add_action( 'style_loader_tag', [ $this, 'defer_style_tags' ], 1, 2 );
		add_action( 'script_loader_tag', [ $this, 'defer_scripts' ], 1, 2 );
		add_action( 'wp_body_open', [ $this, 'body_open_scripts' ], 1 );
		add_action( 'wp_footer', [ $this, 'footer_scripts' ], 100 );
		add_action( 'wp_footer', [ $this, 'init_vars' ], 100 );
		add_action( 'admin_footer', [ $this, 'init_vars' ], 100 );
		add_filter( 'admin_footer', [ $this, 'admin_icons' ] );

		self::$version = wp_get_theme()->version ?? false;

		$this->register_assets();

	}

	public function critical_scripts(): void {

		$file_path = DIVLABS::$path . 'dist/js/critical.min.js';

		if ( file_exists( $file_path ) ) {
			echo '<script id="divlabs-critical-scripts">';
			echo file_get_contents( $file_path );
			echo '</script>';
		}

	}

	private function register_assets(): void {

		function deps( $array = [] ): array {
			return array_merge( [
				'jquery',
				'wp-blocks',
				'wp-element',
				'acf-input'
			], (array) $array );
		}

		/* styles */
		wp_register_style( 'divlabs-editor', DIVLABS::$dist_uri . '/css/editor.min.css', false, self::$version );
		wp_register_style( 'divlabs-admin', DIVLABS::$dist_uri . '/css/admin.min.css', false, self::$version );
		wp_register_style( 'divlabs-sandbox-bundle', DIVLABS::$dist_uri . '/css/bundle.min.css' );
		wp_register_style( 'divlabs-aos', 'https://unpkg.com/aos@2.3.0/dist/aos.css' );

		/* scripts */
		wp_register_script( 'divlabs-sandbox-editor', DIVLABS::$core_dist_uri . '/js/editor.min.js', deps( [ 'wp-editor' ] ), self::$version );
		wp_register_script( 'divlabs-sandbox', DIVLABS::$core_dist_uri . '/js/theme.min.js', deps(), self::$version, false );
		wp_register_script( 'divlabs-sandbox-child', DIVLABS::$dist_uri . '/js/child-theme.min.js', deps(), self::$version, false );
		wp_register_script( 'divlabs-sandbox-admin', DIVLABS::$core_dist_uri . '/js/admin.min.js', deps( [
			'jquery-ui-resizable',
			'wp-editor',
			'divlabs-sandbox'
		] ), self::$version, true );
		wp_register_script( 'divlabs-sandbox-fontawesome', 'https://kit.fontawesome.com/2ac810357a.js', [], null, [
			'in_footer' => true,
			//'strategy'  => 'async defer',
		] );

	}

	public function admin_icons(): void {
		get_template_part( 'core/parts/admin/icons' );
	}

	public function body_open_scripts(): void {
		get_template_part( 'core/parts/site/google', 'analytics', [
			'id' => trim( DIVLABS::get_transient( 'divlabs_advanced_settings_api_google_analytics_id', 'advanced', 'option' ) )
		] );
	}

	public function force_scripts_footer(): void {

		if ( is_admin() ) {
			return;
		}

		global $wp_scripts;

		$queue = $wp_scripts->queue;

		$wp_scripts->queue = array_filter( $wp_scripts->queue, function ( $slug ) {
			return in_array( $slug, [
				//'divlabs-sandbox-fontawesome',
				//'divlabs-sandbox'
			] );
		} );

		$wp_scripts->in_footer = array_unique( array_filter( array_merge( $wp_scripts->in_footer, [
			'jquery',
			'jquery-core',
			'jquery-migrate',
		], $wp_scripts->queue ) ) );

		add_action( 'wp_footer', function () use ( $queue ) {
			foreach ( $queue as $slug ) {
				wp_enqueue_script( $slug, false, false, false, true );
			}
		}, 1 );
	}

	public function editor_assets(): void {

		if ( ! is_admin() || ! ( get_current_screen()->is_block_editor ?? false ) ) {
			return;
		}

		wp_enqueue_style( 'divlabs-editor' );
		wp_enqueue_style( 'divlabs-admin' );

		wp_enqueue_script( 'divlabs-sandbox' );
		wp_enqueue_script( 'divlabs-sandbox-editor' );
		wp_enqueue_script( 'divlabs-sandbox-admin' );
		wp_enqueue_script( 'divlabs-sandbox-fontawesome' );

	}

	public static function init(): WPBS_Scripts {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Scripts();
		}

		return self::$instance;
	}

	public function init_vars(): void {

		$vars = apply_filters( 'divlabs_init_vars', [
			'page_id' => DIVLABS::$nonce ?? false,
			'path'    => [
				'site'  => home_url(),
				'ajax'  => admin_url( 'admin-ajax.php' ),
				'theme' => get_theme_file_uri()
			],
			'post_id' => DIVLABS::$pid
		], false );

		echo '<script type="application/json" id="divlabs-args">' . json_encode( $vars ) . '</script>';

	}

	public function pre_load_critical(): void {

		global $wp_scripts;
		global $wp_styles;

		$preconnect_sources = apply_filters( 'divlabs_preconnect_sources', [] );
		$preload_sources    = apply_filters( 'divlabs_preload_sources', [] );
		$preload_images     = apply_filters( 'divlabs_preload_images', [] );

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

		foreach ( array_unique( array_filter( $preload_images ) ) as $image ) {

			if ( empty( $image['id'] ) ) {
				continue;
			}

			$src          = wp_get_attachment_image_src( $image['id'], $image['size'] ?? 'large' )[0] ?? false;
			$image_srcset = wp_get_attachment_image_srcset( $image['id'] );
			$path         = str_replace( home_url(), ABSPATH, $src );
			$webp         = file_exists( $path . '.webp' );

			echo '<link rel="preload" as="image"';

			echo 'href="' . ( $webp ? $src . '.webp' : $src ) . '"';

			//echo 'media="(max-width: 992px)"';

			if ( $image_srcset ) {
				echo 'imagesrcset="' . $image_srcset . '"';
			}

			if ( $webp ) {
				echo 'type="image/webp"';
			}

			echo '/>';

		}

		$default_styles = [
			//'divlabs-sandbox-bundle',
		];

		$default_scripts = [
			'jquery',
			'jquery-migrate',
			//'divlabs-sandbox',
			//'divlabs-sandbox-fontawesome',
		];

		$preload_scripts = array_values( array_filter( array_map( function ( $slug ) use ( $wp_scripts, $default_scripts ) {
			return in_array( $slug, $default_scripts ) ? $wp_scripts->registered[ $slug ]->src ?? '' : [];
		}, $wp_scripts->queue ?? [] ) ) );

		$preload_styles = array_values( array_filter( array_map( function ( $slug ) use ( $wp_styles, $default_styles ) {
			return in_array( $slug, $default_styles ) ? $wp_styles->registered[ $slug ]->src ?? '' : [];
		}, $wp_styles->queue ?? [] ) ) );

		foreach ( array_unique( array_filter( apply_filters( 'divlabs_preload_scripts', $preload_scripts ) ) ) as $url ) {
			echo '<link rel="preload" as="script" href="' . $url . '">';
		}

		foreach ( array_unique( array_filter( apply_filters( 'divlabs_preload_styles', $preload_styles ) ) ) as $url ) {
			echo '<link rel="preload" as="style" href="' . $url . '">';
		}

	}

	public function admin_scripts(): void {

		if ( ! is_admin() || get_current_screen()->is_block_editor ?? false ) {
			return;
		}

		wp_enqueue_script( 'divlabs-sandbox' );
		wp_enqueue_script( 'divlabs-sandbox-admin' );
		wp_enqueue_script( 'divlabs-sandbox-fontawesome' );
		wp_enqueue_style( 'divlabs-admin' );
		wp_enqueue_code_editor( [ 'type' => 'javascript' ] );

	}

	public function custom_properties(): void {

		$background_image_mobile = get_field( 'divlabs_sandbox_options_background_image_mobile', 'option' );
		$background_image_large  = get_field( 'divlabs_sandbox_options_background_image_large', 'option' );

		$properties = array_filter( apply_filters( 'divlabs_custom_properties', array_filter( [
			'--divlabs-body-bg-repeat'       => match ( get_field( 'divlabs_sandbox_options_background_repeat', 'option' ) ) {
				'vertical' => 'repeat-y',
				'full' => 'repeat',
				default => 'no-repeat',
			},
			'--divlabs-body-bg-overlay'      => get_field( 'divlabs_sandbox_options_background_overlay', 'option' ),
			'--divlabs-body-bg-attachment'   => ! empty( get_field( 'divlabs_sandbox_options_background_fixed', 'option' ) ) ? 'fixed' : 'scroll',
			'--divlabs-body-bg-image-mobile' => ! $background_image_mobile ? 'none' : 'url("' . ( wp_get_attachment_image_src( $background_image_mobile, 'full' )[0] ?? '#' ) . '")',
			'--divlabs-body-bg-image-large'  => ! $background_image_large ? 'none' : 'url("' . ( wp_get_attachment_image_src( $background_image_large, 'full' )[0] ?? '#' ) . '")',
			'--divlabs-body-bg-size'         => match ( get_field( 'divlabs_sandbox_options_background_size', 'option' ) ) {
				'half' => '50% auto',
				'full' => '100% auto',
				'third' => '33% auto',
				'cover' => 'cover',
				'contain' => 'contain',
				'custom' => get_field( 'divlabs_sandbox_options_background_size_custom', 'option' ) ?: 'auto',
				default => 'auto',
			},
			'--divlabs-body-bg-position'     => match ( get_field( 'divlabs_sandbox_options_background_position', 'option' ) ) {
				'top' => 'top',
				'left' => 'left',
				'right' => 'right',
				'bottom' => 'bottom',
				'top-left' => 'top left',
				'top-right' => 'top right',
				'bottom-left' => 'bottom left',
				'bottom-right' => 'bottom right',
				'custom' => get_field( 'divlabs_sandbox_options_background_position_custom', 'option' ) ?: 'center',
				default => 'center'
			},
		] ) ) );

		if ( ! empty( $properties ) ) {
			echo '<style>';
			echo 'body{';
			foreach ( $properties as $property => $value ) {
				if ( empty( $value ) ) {
					continue;
				}
				echo implode( ':', [ $property, $value ] ) . ';';
			}
			echo '}';
			echo '</style>';
		}

	}

	public function enqueue_assets(): void {

		wp_enqueue_style( 'divlabs-sandbox-bundle' );
		wp_enqueue_style( 'divlabs-aos' );
		wp_enqueue_script( 'divlabs-sandbox-fontawesome' );
		wp_enqueue_script( 'divlabs-sandbox' );
		wp_enqueue_script( 'divlabs-sandbox-child' );

		foreach (
			array_unique( array_merge(
				glob( get_stylesheet_directory() . '/features/**/js/*.min.js' ),
				glob( DIVLABS::$path . 'features/**/js/*.min.js' ),
			) ) as $path
		) {

			$slug = str_replace( [ 'class-', '.min' ], [ '' ], pathinfo( $path, PATHINFO_FILENAME ) );
			$uri  = get_site_url() . '/' . str_replace( ABSPATH, '', $path );

			wp_register_script( $slug, $uri, [ 'jquery', 'divlabs-sandbox' ], false, [
				'strategy' => 'async'
			] );
			//wp_enqueue_script( $slug );
		}

	}

	public function header_scripts(): void {

		get_template_part( 'core/parts/site/google', 'analytics', [
			'id'   => trim( DIVLABS::get_transient( 'divlabs_advanced_settings_api_google_analytics_id', 'advanced', 'option' ) ),
			'head' => true
		] );

		$scripts = array_merge(
			array_filter( get_field( 'divlabs_advanced_settings', 'option' )['scripts'] ?? false ?: [], function ( $script ) {
				return ! empty( $script['in_header'] ) && ! empty( $script['enabled'] );
			}, ARRAY_FILTER_USE_BOTH ),
			array_filter( get_field( 'page_scripts', get_the_ID() )['scripts'] ?? false ?: [], function ( $script ) {
				return ! empty( $script['in_header'] ) && ! empty( $script['enabled'] );
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
			array_filter( get_field( 'divlabs_advanced_settings', 'option' )['scripts'] ?? false ?: [], function ( $script ) {
				return empty( $script['in_header'] ) && ! empty( $script['enabled'] );
			}, ARRAY_FILTER_USE_BOTH ),
			array_filter( get_field( 'page_scripts', get_the_ID() )['scripts'] ?? false ?: [], function ( $script ) {
				return empty( $script['in_header'] ) && ! empty( $script['enabled'] );
			}, ARRAY_FILTER_USE_BOTH ),
		);

		if ( ! empty( $scripts ) ) {

			echo "<!-- Footer Scripts -->\r\n";

			foreach ( $scripts as $script ) {
				echo $script['script'] ?? false;
			}
		}

	}

	public function critical_css(): void {

		$critical_css         = DIVLABS::$dist_path . 'css/theme.min.css';
		$additional_css_files = array_unique( apply_filters( 'divlabs_critical_css', $paths = [] ) );

		if ( file_exists( $critical_css ) ) {
			echo "<!-- Critical CSS -->\r\n";
			echo "<style>" . file_get_contents( $critical_css ) . "</style>";
		}

		if ( ! empty( $additional_css_files ) ) {
			echo "<!-- Additional CSS -->\r\n";
			echo '<style>';
			ob_start();
			foreach ( $additional_css_files as $file_path ) {
				if ( file_exists( $file_path ) ) {
					echo file_get_contents( $file_path );
				}
			}
			echo ob_get_clean();
			echo '</style>';
		}

	}

	public function defer_style_tags( $tag, $handle ) {

		$plugin_handles = [
			//'divlabs-aos',
			//'divlabs-sandbox-fonts',
		];

		$handle_check = ! in_array( $handle, $plugin_handles );

		if (
			! DIVLABS::$helper->is_admin() &&
			$handle_check
		) {
			return str_replace( 'href', 'data-href', $tag );
		}

		return $tag;
	}

	public function defer_scripts( $tag, $handle ) {

		if (
			! DIVLABS::$helper->is_admin() &&
			! str_starts_with( $handle, 'wp' ) &&
			! str_starts_with( $handle, 'wc' ) &&
			! str_starts_with( $handle, 'woo' ) &&
			! str_starts_with( $handle, 'react' ) &&
			//! str_starts_with( $handle, 'gform' ) &&
			! str_contains( $handle, 'recaptcha' ) &&
			! in_array( $handle, [
				'underscore',
				'react',
				'react-dom',
				'lodash',
				'sourcebuster-js',
				'jquery',
				'jquery-core',
				'jquery-migrate',
			] )
		) {

			$attributes = [ 'defer' ];

			if (
				in_array( $handle, [] )
			) {
				$attributes = [ 'async' ];
			}

			if (
				in_array( $handle, [
					'divlabs-sandbox-fontawesome'
				] )
			) {
				$attributes = [ 'async defer' ];
			}

			return str_replace( 'src', implode( ' ', [ join( ' ', $attributes ), 'src' ] ), $tag );
		}

		return $tag;

	}

}


