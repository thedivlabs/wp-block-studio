<?php

if ( class_exists( 'WPBS' ) ) {
	return false;
}

class WPBS {

	private static WPBS $instance;

	public static string $path;
	public static string $core_path;
	public static string $nonce;
	public static string $nonce_id;
	public static string $transient_base;
	public static string $dist_path;
	public static string $dist_uri;

	public static int|bool $pid = false;

	private function __construct() {

		self::$transient_base = 'wpbs';
		self::$path           = trailingslashit( get_template_directory() );
		self::$core_path      = self::$path . 'core/';
		self::$dist_path      = ( is_child_theme() ? trailingslashit( get_stylesheet_directory() ) : self::$path ) . 'dist/';
		self::$dist_uri       = str_replace( get_stylesheet_directory(), get_stylesheet_directory_uri(), self::$dist_path );

		$this->set_nonce();

		if ( isset( $_GET['wpbs-cache'] ) ) {
			self::clear_transients();
		}

		add_action( 'init', [ $this, 'theme_support' ], 15 );
		add_action( 'init', [ $this, 'theme_assets' ], 20 );
		add_action( 'enqueue_block_editor_assets', [ $this, 'editor_assets' ] );
		add_action( 'enqueue_block_assets', [ $this, 'admin_assets' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'view_assets' ] );

		add_action( 'acf/init', [ $this, 'init_theme' ] );
		add_action( 'acf/init', [ $this, 'init_hook' ] );

		add_action( 'wp_after_insert_post', [ $this, 'clear_transients' ], 100 );
		add_filter( 'acf/settings/load_json', [ $this, 'load_json' ], 100 );
		add_filter( 'acf/settings/save_json', [ $this, 'save_json' ] );

		apply_filters( 'nonce_life', HOUR_IN_SECONDS );

	}

	public function theme_assets(): void {
		wp_register_style( 'wpbs-theme-css', get_stylesheet_directory_uri() . '/dist/theme.min.css' );
		wp_register_style( 'wpbs-admin-css', get_stylesheet_directory_uri() . '/dist/admin.min.css' );
		wp_register_script( 'wpbs-theme-js', get_stylesheet_directory_uri() . '/dist/theme.min.js' );

	}

	public function admin_assets(): void {
		wp_enqueue_style( 'wpbs-theme-css' );
		wp_enqueue_style( 'wpbs-admin-css' );
	}


	public function editor_assets(): void {
		add_editor_style();
	}

	public function view_assets(): void {
		wp_enqueue_style( 'wpbs-theme-css' );
		wp_enqueue_script( 'wpbs-theme-js' );
	}


	public function theme_support(): void {

		add_theme_support( 'custom-spacing' );
		add_theme_support( 'custom-units' );
		add_theme_support( 'block-template-parts' );
		add_theme_support( 'core-block-patterns' );
		add_theme_support( 'custom-background' );
		add_theme_support( 'editor-styles' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'appearance-tools' );
		add_theme_support( 'wp-block-styles' );
		add_theme_support( 'border' );
		//add_theme_support( 'editor-color-palette' );
		//add_theme_support( 'editor-gradient-presets' );

	}


	public function init_theme(): void {

		require_once self::$core_path . 'modules/class-wpbs-wp.php';
		require_once self::$core_path . 'modules/class-wpbs-blocks.php';
		require_once self::$core_path . 'modules/class-wpbs-style.php';
		require_once self::$core_path . 'modules/class-wpbs-layout.php';
		require_once self::$core_path . 'modules/class-wpbs-props.php';
		require_once self::$core_path . 'modules/class-wpbs-background.php';
		require_once self::$core_path . 'modules/class-wpbs-endpoints.php';

		WPBS_WP::init();
		WPBS_Blocks::init();
		WPBS_Style::init();
		WPBS_Endpoints::init();

		do_action( 'wpbs_init' );
	}

	public function init_hook(): void {

		self::$pid = self::get_pid();

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


		return array_merge( $paths, self::get_acf_load_paths() );

	}

	static function get_acf_load_paths(): array {

		$acf_json_paths = array_unique( array_merge(
			glob( self::$path . 'acf-json', GLOB_ONLYDIR )
		) );

		sort( $acf_json_paths );

		return array_merge( $acf_json_paths, [
			get_stylesheet_directory() . '/acf-json',
		] );

	}

	public static function get_pid(): int|bool {
		global $post;
		if (
			is_admin() ||
			( is_admin() && ( $_GET['action'] ?? false ) == 'edit' )
		) {
			return is_int( $_GET['post'] ?? false ) || is_string( $_GET['post'] ?? false ) ? $_GET['post'] : false;
		} else {
			return match ( true ) {
				is_home() => get_option( 'page_for_posts' ),
				is_post_type_archive() => false,
				is_tax() => get_taxonomy( get_queried_object()->taxonomy ?? false )->name ?? false,
				default => $post->ID ?? false,
			};
		}


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

			$data = WPBS::clean_array( get_field( $field_id, $post_id ?? false ) );

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
		self::$nonce_id = join( '_', [
			'wpbs_page_id',
			//(string) current_time( 'timestamp' )
		] );
		self::$nonce    = wp_create_nonce( self::$nonce_id );
	}

	public static function init(): WPBS {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS();
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

	public static function parse_style( string $attr = '', bool $property = true ): string|bool|array {

		if ( empty( $attr ) ) {
			return false;
		}

		if ( preg_match( '/^#[a-f0-9]{8}$/i', $attr ) ) {
			return $attr;
		}

		if ( str_contains( $attr, 'var:' ) ) {

			$result = str_replace( [ 'var:', '|', ' ' ], [ '', '--', '' ], $attr );

			if ( $property ) {
				return 'var(' . '--wp--' . $result . ')';
			}

			return '--wp--' . $result;
		}

		//return preg_replace( '/\s+/', '|', $attr );
		return $attr;

	}

	public static function block_type( $block = [] ): string|bool {

		return array_values( array_filter( array_map( function ( $class ) {
			return str_contains( $class, 'is-style-' ) ? str_replace( 'is-style-', '', $class ) : null;
		}, explode( ' ', $block->attributes['className'] ?? '' ) ) ) )[0] ?? false;
	}

	public static function parse_prop( $prop ): string|false {

		if ( ! is_string( $prop ) ) {
			return false;
		}


		$prop = preg_split( '/(?=[A-Z])/', $prop );

		unset( $prop[0] );

		return strtolower( str_replace( ' ', '-', implode( ' ', $prop ) ) );


	}


}

