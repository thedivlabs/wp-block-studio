<?php

class WPBS_Team {

	private static WPBS_Team $instance;

	public static string $singular;
	public static string $plural;
	public static string $slug;

	public static string $tax_singular;
	public static string $tax_plural;
	public static string $tax_slug;

	private function __construct() {

		self::$singular = 'Team';
		self::$plural   = 'Team Members';
		self::$slug     = sanitize_title( self::$singular );

		self::$tax_singular = 'Department';
		self::$tax_plural   = 'Departments';
		self::$tax_slug     = sanitize_title( self::$tax_singular );

		$labels = [
			'label'         => 'Team',
			'name'          => 'Team',
			'menu_name'     => 'Team',
			'singular_name' => 'Team Member',
			'archives'      => 'Team'
		];

		WPBS_Taxonomy::register( self::$tax_singular, self::$tax_plural, [ 'team' ], self::$tax_slug );

		WPBS_CPT::register( self::$singular, self::$plural, self::$slug, [
			'menu_icon'     => 'dashicons--team',
			'menu_position' => 25,
			'supports'      => [ 'thumbnail', 'title', 'page-attributes' ],
			'has_archive'   => 'team',
			'taxonomies'    => [ self::$tax_slug ]
		], $labels, false, false, false, true );

		add_action( 'acf/save_post', [ $this, 'set_name_title' ], 10, 3 );
		add_action( 'wp_ajax_team_modal', [ $this, 'modal' ] );
		add_action( 'wp_ajax_nopriv_team_modal', [ $this, 'modal' ] );
		add_action( 'pre_get_posts', [ $this, 'set_query_vars' ] );
		add_filter( 'template_redirect', [ $this, 'redirect_taxonomy' ] );

		add_filter( 'default_wp_template_part_areas', [ $this, 'register_template_part' ] );

		add_action( 'wp_ajax_team_profile', [ $this, 'wpbs_team_profile_ajax' ] );
		add_action( 'wp_ajax_nopriv_team_profile', [ $this, 'wpbs_team_profile_ajax' ] );


	}

	public function redirect_taxonomy(): void {
		if ( is_tax( self::$tax_slug ) ) {
			wp_redirect( get_post_type_archive_link( self::$slug ) );
			exit();
		}
	}

	public function register_template_part( $areas ): array {

		return array_merge( [], $areas ?? [], [
			[
				'area'        => 'team-profile',
				'area_tag'    => 'team',
				'label'       => __( 'Team Profile', 'wpbs' ),
				'description' => __( 'Team profile template', 'wpbs' ),
				'icon'        => 'layout'
			]
		] );
	}

	public function wpbs_team_profile_ajax() {
		$post_id = absint( $_GET['postId'] ?? 0 );

		if ( ! $post_id || ! get_post( $post_id ) ) {
			wp_send_json_error( 'Invalid post ID' );
		}

		// --- Render the template part ---
		ob_start();

		$block = new WP_Block(
			[
				'blockName' => 'core/template-part',
				'attrs'     => [
					'slug'   => 'team-profile',
					'postId' => $post_id,
				],
			],
			[
				'wpbs/postId' => $post_id,
				'wpbs/ajax'   => true,
			]
		);

		echo $block->render();
		$html = ob_get_clean();

		// --- Get the template part post content ---
		$template_posts = get_posts( [
			'post_type'      => 'wp_template_part',
			'name'           => 'team-profile',
			'posts_per_page' => 1,
		] );

		$style_urls = [];
		$inline_css = [];

		if ( ! empty( $template_posts ) ) {
			$template_content = $template_posts[0]->post_content;
			$blocks           = parse_blocks( $template_content );

			$collected = $this->collect_block_styles_and_inline( $blocks );

			// Convert handles to URLs
			foreach ( $collected['styles'] as $handle ) {
				if ( isset( wp_styles()->registered[ $handle ] ) ) {
					$style_urls[] = wp_styles()->registered[ $handle ]->src;
				}
			}

			$style_urls = array_unique( array_filter( $style_urls ) );
			$inline_css = $collected['inline_css'];
		}

		wp_send_json_success( [
			'rendered'   => $html,
			'postId'     => $post_id,
			'styles'     => $style_urls,
			'inline_css' => $inline_css,
		] );
	}


	private function collect_block_styles_and_inline( $blocks ) {
		$styles     = [];
		$inline_css = [];
		$registry   = WP_Block_Type_Registry::get_instance();

		foreach ( $blocks as $block ) {
			if ( ! empty( $block['blockName'] ) ) {
				$block_type = $registry->get_registered( $block['blockName'] );

				// 1. Collect style handle (from block.json)
				if ( $block_type && ! empty( $block_type->style ) ) {
					$styles[] = $block_type->style;
				}

				// 2. Collect inline CSS from wpbs-css attribute
				if ( ! empty( $block['attrs']['wpbs-css'] ) && is_string( $block['attrs']['wpbs-css'] ) ) {
					$inline_css[] = $block['attrs']['wpbs-css'];
				}
			}

			// Recursively handle inner blocks
			if ( ! empty( $block['innerBlocks'] ) ) {
				$nested     = $this->collect_block_styles_and_inline( $block['innerBlocks'] );
				$styles     = array_merge( $styles, $nested['styles'] );
				$inline_css = array_merge( $inline_css, $nested['inline_css'] );
			}
		}

		return [
			'styles'     => array_unique( $styles ),
			'inline_css' => $inline_css,
		];
	}


	public function set_query_vars( $query ): void {
		if (
			! is_admin() &&
			$query->is_main_query() &&
			( $query->query_vars['post_type'] ?? false ) == self::$slug
		) {

			$query->set( 'posts_per_page', - 1 );
		}

	}


	public function set_name_title( $post_id ): void {

		$post = get_post( $post_id );

		if (
			is_admin() &&
			( $post->post_type ?? false ) == self::$slug
		) {
			$fields = WPBS::clean_array( array_filter( get_field( 'wpbs_details_general', $post_id ), function ( $k ) {
				return in_array( $k, [
					'first_name',
					'middle_name',
					'last_name'
				] );
			}, ARRAY_FILTER_USE_KEY ) );

			$post_title = ucwords( trim( implode( ' ', array_filter( [
				$fields['first_name'] ?? null,
				$fields['middle_name'] ?? null,
				$fields['last_name'] ?? null,
			] ) ) ) );

			if ( ! empty( $post_title ) ) {

				wp_update_post( [
					'ID'         => $post_id,
					'post_title' => $post_title,
					'post_name'  => wp_unique_post_slug( sanitize_title( $post_title ), $post_id, $post->post_status, $post->post_type, $post->post_parent )
				] );
			}
		}

	}

	public static function init(): WPBS_Team {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Team();
		}

		return self::$instance;
	}

}

