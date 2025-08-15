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

		register_rest_route( 'wpbs/v1', '/team-profile', array(
			'methods'             => 'POST',
			'callback'            => [ $this, 'render_profile' ],
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

	public function render_profile( WP_REST_Request $request ): WP_REST_Response {
		$postId = absint( $request->get_param( 'postId' ) );
		$theme  = wp_get_theme()->get_stylesheet();

		$block = new WP_Block(
			[
				'blockName' => 'core/template-part',
				'attrs'     => [
					'slug'    => 'team-profile',
					'theme'   => $theme,
					'tagName' => 'div',
				],
			],
			[
				'postId'   => $postId,
				'postType' => get_post_type( $postId ),
			]
		);

		$html = $block->render();

		return new WP_REST_Response(
			[
				'success'  => true,
				'rendered' => $html,
				//'styles'   => $styles,
			],
			200
		);
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

	#[NoReturn] public function modal(): void {

		/*if ( ! WPBS_Ajax::security_check() ) {
			wp_send_json_error( 'Invalid security token sent.' );
			wp_die();
		}*/


		ob_start();
		//echo $_GET['id'];

		$id = sanitize_text_field( $_GET['id'] ?? '' );

		$query = new WP_Query( [
			'post_type' => 'team',
			'post__in'  => [ $id ]
		] );

		while ( $query->have_posts() ) {
			$query->the_post();
			echo '<div class="wpbs-team-member-profile w-fit max-w-full m-auto">';
			block_template_part( 'team-profile' );
			do_action( 'wpbs_ajax_block_properties' );
			echo '</div>';
		}


		$result = ob_get_clean();

		die( json_encode( $result ) );

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

