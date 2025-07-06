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
		self::$dist_path      = ( is_child_theme() ? trailingslashit( get_stylesheet_directory() ) : self::$path ) . 'build/';
		self::$dist_uri       = str_replace( get_stylesheet_directory(), get_stylesheet_directory_uri(), self::$dist_path );

		$this->set_nonce();

		if ( isset( $_GET['wpbs-cache'] ) && current_user_can( 'manage_options' ) ) {
			self::clear_transients();
		}

		add_action( 'init', [ $this, 'theme_assets' ], 20 );
		add_action( 'enqueue_block_editor_assets', [ $this, 'editor_assets' ] );
		add_action( 'enqueue_block_assets', [ $this, 'block_assets' ] );
		add_action( 'admin_init', [ $this, 'admin_assets' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'view_assets' ] );
		add_action( 'wp_head', [ $this, 'pre_load_critical' ], 2 );
		add_action( 'wp_head', [ $this, 'critical_css' ], 5 );
		add_action( 'wp_footer', [ $this, 'output_vars' ], 30 );

		add_action( 'acf/init', [ $this, 'init_theme' ] );
		add_action( 'acf/init', [ $this, 'init_hook' ] );

		add_action( 'wp_after_insert_post', [ $this, 'clear_transients' ], 100 );
		add_filter( 'acf/settings/load_json', [ $this, 'load_json' ], 100 );
		add_filter( 'acf/settings/save_json', [ $this, 'save_json' ] );

		apply_filters( 'nonce_life', HOUR_IN_SECONDS );

		add_filter( 'wp_get_attachment_image', [ $this, 'kill_img_src' ], 300, 5 );

	}

	public function kill_img_src( $html, $attachment_id, $size, $icon, $attr ): string {

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

		$css = apply_filters( 'wpbs_critical_css', [] );

		$css = array_unique( $css );

		echo '<style class="wpbs-critical-css">';
		echo join( ' ', array_values( $css ) );
		echo file_get_contents( $theme_css_path );
		echo '</style>';

	}

	public function theme_assets(): void {
		wp_register_style( 'wpbs-theme-css', get_stylesheet_directory_uri() . '/build/theme.css' );
		wp_register_style( 'wpbs-admin-css', get_stylesheet_directory_uri() . '/build/admin.css' );
		wp_register_script( 'wpbs-theme-js', get_stylesheet_directory_uri() . '/build/theme.js', [
			'wp-dom-ready',
			'jquery'
		], false, [
			'strategy'  => 'defer',
			'in_footer' => false,
		] );
		wp_register_script( 'wpbs-fontawesome', 'https://kit.fontawesome.com/2ac810357a.js', [], false, [
			'strategy'  => 'async',
			'in_footer' => false,
		] );

		/* Swiper */
		wp_register_style( 'wpbs-swiper-css', 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css' );
		wp_register_script( 'wpbs-swiper-js', 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js' );

		/* Masonry */
		wp_register_script( 'wpbs-masonry-js', 'https://unpkg.com/masonry-layout@4/dist/masonry.pkgd.min.js', [], false, [
			'strategy'  => 'async',
			'in_footer' => true,
		] );

		wp_localize_script( 'wpbs-theme-js', 'wpbsData', [
			'nonce'       => wp_create_nonce( 'wp_rest' ),
			'breakpoints' => wp_get_global_settings()['custom']['breakpoints'] ?? [],
			'containers'  => wp_get_global_settings()['custom']['container'] ?? [],
			'colors'      => array_values( array_merge( wp_get_global_settings()['color']['palette']['theme'] ?? [], wp_get_global_settings()['color']['palette']['default'] ?? [] ) ),
		] );

	}

	public function block_assets(): void {

		wp_enqueue_script( 'wpbs-masonry-js' );

		wp_enqueue_script( 'wpbs-theme-js' );
		wp_enqueue_script( 'wpbs-fontawesome' );
		wp_enqueue_style( 'wpbs-theme-css' );

		wp_enqueue_script( 'wpbs-swiper-js' );
		wp_enqueue_style( 'wpbs-swiper-css' );
	}

	public function admin_assets(): void {
		//wp_enqueue_style( 'wpbs-theme-css' );
		wp_enqueue_style( 'wpbs-admin-css' );
	}

	public function editor_assets(): void {
		wp_enqueue_style( 'wpbs-admin-css' );
	}

	public function view_assets(): void {
		wp_enqueue_style( 'wpbs-theme-css' );
		wp_enqueue_script( 'wpbs-theme-js' );
		wp_enqueue_script( 'wpbs-fontawesome' );
		wp_enqueue_script( 'wpbs-masonry-js' );
	}

	public function init_theme(): void {

		require_once self::$core_path . 'modules/class-wpbs-wp.php';
		require_once self::$core_path . 'modules/class-wpbs-blocks.php';
		require_once self::$core_path . 'modules/class-wpbs-style.php';
		require_once self::$core_path . 'modules/class-wpbs-cpt.php';
		require_once self::$core_path . 'modules/class-wpbs-taxonomy.php';
		require_once self::$core_path . 'modules/class-wpbs-popup.php';

		WPBS_WP::init();
		WPBS_Blocks::init();
		WPBS_Style::init();
		WPBS_CPT::init();
		WPBS_Taxonomy::init();
		WPBS_Popup::init();

		self::init_classes( 'core/components' );

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
			glob( self::$path . 'acf-json', GLOB_ONLYDIR ),
			glob( self::$path . 'core/acf-json', GLOB_ONLYDIR ),
			glob( self::$path . 'features/**/acf-json', GLOB_ONLYDIR ),
		) );

		sort( $acf_json_paths );

		return array_merge( $acf_json_paths, [
			//get_stylesheet_directory() . '/acf-json',
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

			$data = get_field( $field_id, $post_id ?? false );

			$data = WPBS::clean_array( $data );

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

	public function pre_load_critical(): void {

		global $wp_scripts;
		global $wp_styles;

		$preconnect_sources = apply_filters( 'wpbs_preconnect_sources', [] );
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

		foreach ( array_unique( array_keys( $preload_images ) ) as $k => $image_id ) {

			$image_data = $preload_images[ $image_id ];

			$src          = wp_get_attachment_image_src( $image_id, $image_data['resolution'] ?? 'large' )[0] ?? false;
			$image_srcset = wp_get_attachment_image_srcset( $image_id );
			$path         = str_replace( home_url(), ABSPATH, $src );
			$webp         = true;
			$breakpoints  = wp_get_global_settings()['custom']['breakpoints'] ?? [];
			$operator     = ! empty( $image_data['mobile'] ) ? '<' : '>=';

			echo '<link rel="preload" as="image" data-preload-id="' . $image_id . '"';

			echo 'href="' . ( $src . '.webp' ) . '"';

			if ( ! empty( $image_data['breakpoint'] ) ) {
				echo 'media="(width ' . $operator . ' ' . ( $breakpoints[ $image_data['breakpoint'] ] ?? '992px' ) . ')"';
			}


			/*if ( $image_srcset ) {
				echo 'imagesrcset="' . ( ! $webp ? $image_srcset : str_replace( [ '.jpg','.png','.jpeg' ], [ '.jpg.webp','.png.webp','.jpeg.webp' ], $image_srcset ) ) . '"';
			}*/

			echo 'type="image/webp"';

			echo '/>';

		}


		$default_styles = [
			//'wpbs-sandbox-bundle',
		];

		$default_scripts = [
			'jquery',
			'jquery-migrate',
			//'wpbs-sandbox',
			//'wpbs-sandbox-fontawesome',
		];

		$preload_scripts = array_values( array_filter( array_map( function ( $slug ) use ( $wp_scripts, $default_scripts ) {
			return in_array( $slug, $default_scripts ) ? $wp_scripts->registered[ $slug ]->src ?? '' : [];
		}, $wp_scripts->queue ?? [] ) ) );

		$preload_styles = array_values( array_filter( array_map( function ( $slug ) use ( $wp_styles, $default_styles ) {
			return in_array( $slug, $default_styles ) ? $wp_styles->registered[ $slug ]->src ?? '' : [];
		}, $wp_styles->queue ?? [] ) ) );

		foreach ( array_unique( array_filter( apply_filters( 'wpbs_preload_scripts', $preload_scripts ) ) ) as $url ) {
			echo '<link rel="preload" as="script" href="' . $url . '">';
		}

		foreach ( array_unique( array_filter( apply_filters( 'wpbs_preload_styles', $preload_styles ) ) ) as $url ) {
			echo '<link rel="preload" as="style" href="' . $url . '">';
		}

	}

	public static function output_vars(): void {

		$vars = apply_filters( 'wpbs_init_vars', [
			//'page_id' => DIVLABS::$nonce ?? false,
			'path'    => [
				'site'  => home_url(),
				'ajax'  => admin_url( 'admin-ajax.php' ),
				'theme' => get_theme_file_uri()
			],
			'post_id' => self::$pid
		], false );

		echo '<script type="application/json" id="wpbs-args">' . json_encode( $vars ) . '</script>';

	}

	public static function clean_array( $array, &$ref_array = [] ): mixed {
		$array = ! empty( $array ) ? $array : $ref_array;
		if ( ! is_array( $array ) ) {
			return $array;
		}
		foreach ( $array as $key => &$value ) {
			if ( is_array( $value ) ) {
				$value = self::clean_array( false, $value );
			}
			if (
				empty( $value ) ||
				( empty( $key ) && $key !== 0 )
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

	public static function sanitize_block_template( $block ): array {

		$counter = 0;

		return self::sanitize_block_template_recursive( $block, $counter );

	}

	private static function sanitize_block_template_recursive( $block, &$counter = 0, $max_blocks = 30 ): array {
		if ( ++ $counter > $max_blocks ) {
			return [];
		}

		return [
			'blockName'    => $block['blockName'] ?? '',
			'attrs'        => array_map( [ __CLASS__, 'recursive_sanitize' ], $block['attrs'] ?? [] ),
			'innerBlocks'  => array_map( function ( $b ) use ( &$counter, $max_blocks ) {
				return self::sanitize_block_template_recursive( $b, $counter, $max_blocks );
			}, $block['innerBlocks'] ?? [] ),
			'innerHTML'    => wp_kses_post( $block['innerHTML'] ?? '' ),
			'innerContent' => array_map( function ( $item ) {
				return is_string( $item ) ? wp_kses_post( $item ) : null;
			}, $block['innerContent'] ?? [] ),
		];
	}

	public static function sanitize_query_args( $args ): array {
		$sanitized = [];

		foreach ( $args as $key => $value ) {
			$sanitized[ $key ] = match ( $key ) {
				'post_type', 'orderby', 'order', 'post_status', 'author_name', 'name' => sanitize_key( $value ),
				'posts_per_page', 'paged', 'author', 'p' => absint( $value ),
				'post__in', 'post__not_in', 'category__in', 'tag__in' => array_map( 'absint', (array) $value ),
				's' => sanitize_text_field( $value ),
				default => is_scalar( $value ) ? sanitize_text_field( $value ) : $value,
			};
		}

		return WPBS::clean_array( $sanitized );
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

	public static function recursive_sanitize( $input ) {

		if ( is_array( $input ) ) {
			$sanitized = [];

			foreach ( $input as $key => $value ) {

				$sanitized_key = is_string( $key ) ? sanitize_text_field( $key ) : $key;

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

		} else {

			return $input;
		}
	}

	public static function get_youtube_poster_image( $share_link = '', $args = [] ): string|bool {

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

		return '<img src="https://i3.ytimg.com/vi/' . $video_id . '/hqdefault.jpg" class="' . $class . '" alt="" />';

	}


}

