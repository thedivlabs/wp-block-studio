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

		if ( WPBS::feature_disabled( self::$slug ) ) {
			return;
		}

		$labels = [
			'label'     => 'Team',
			'name'     => 'Team',
			'menu_name'     => 'Team',
			'singular_name' => 'Team Member',
			'archives'      => 'Team'
		];

		WPBS::$taxonomy->register( self::$tax_singular, self::$tax_plural, [ 'team' ], self::$tax_slug );

		WPBS::$cpt->register( self::$singular, self::$plural, self::$slug, [
			'menu_icon'     => 'dashicons--team',
			'menu_position' => 25,
			'supports'      => [ 'thumbnail', 'title', 'page-attributes' ],
			'has_archive'   => 'team',
			'taxonomies'    => [ self::$tax_slug ]
		], $labels, false, false, false, true );

		add_action( 'wp_enqueue_scripts', [ $this, 'init_assets' ] );
		add_action( 'acf/save_post', [ $this, 'set_name_title' ], 10, 3 );
		add_action( 'wp_ajax_team_modal', [ $this, 'modal' ] );
		add_action( 'wp_ajax_nopriv_team_modal', [ $this, 'modal' ] );
		add_action( 'wp_ajax_team_data', [ $this, 'gallery_data' ] );
		add_action( 'wp_ajax_nopriv_team_data', [ $this, 'gallery_data' ] );
		add_action( 'pre_get_posts', [ $this, 'set_query_vars' ] );
		add_filter( 'template_redirect', [ $this, 'redirect_taxonomy' ] );

		add_filter( 'default_wp_template_part_areas', [ $this, 'register_template_part' ] );

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
				'label'       => __( 'Team Profile', 'divlabs' ),
				'description' => __( 'Team profile template', 'divlabs' ),
				'icon'        => 'layout'
			]
		] );
	}

	public function init_assets(): void {


		$path   = trailingslashit( str_replace( get_template_directory(), get_template_directory_uri(), dirname( __FILE__ ) ) );
		$blocks = array_map( function ( $block_path ) {
			return pathinfo( $block_path )['basename'];
		}, glob( dirname( __FILE__ ) . '/blocks/**', GLOB_ONLYDIR ) );

		wp_register_script( 'divlabs-team', $path . 'js/class-divlabs-team.js', [ 'jquery' ], WPBS_Scripts::$version, [
			'strategy'  => 'async',
			'in_footer' => true
		] );

		if ( WPBS::has_blocks( $blocks ) ) {
			wp_enqueue_script( 'divlabs-team' );
		}

	}

	public function gallery_data(): void {
		/*if ( ! WPBS_Ajax::security_check() ) {
					wp_send_json_error( 'Invalid security token sent.' );
					wp_die();
				}*/

		$result = [];

		$result = array_map( function ( $post_id ) {
			return [
				'department' => wp_list_pluck( get_the_terms( $post_id, 'department' ), 'term_id' ),
				'id'         => $post_id,
			];
		}, ( new WP_Query( [
			'post_type'     => 'team',
			'fields'        => 'ids',
			'post_status'   => 'publish',
			'no_found_rows' => true,
		] ) )->posts );


		die( json_encode( $result ) );

	}

	public static function gallery_pagination( $options = [] ): void {
		WPBS::component( 'parts/grid', 'pagination', $options, false, self::$slug, false );
	}

	public static function gallery_options( $options = [] ): void {

		echo '<script type="application/json" class="divlabs-team-gallery-options">';
		echo json_encode( WPBS::clean_array( $options ) );
		echo '</script>';

		$result = array_map( function ( $post_id ) {
			return [
				'department' => wp_list_pluck( get_the_terms( $post_id, 'department' ), 'term_id' ),
				'id'         => $post_id,
			];
		}, ( new WP_Query( [
			'post_type'     => 'team',
			'fields'        => 'ids',
			'post_status'   => 'publish',
			'no_found_rows' => true,
		] ) )->posts );

		echo '<script type="application/json" class="divlabs-team-gallery-data">';
		echo json_encode( WPBS::clean_array( $result ) );
		echo '</script>';


	}

	private static function grid_data( $args = [] ): array {
		if ( ! empty( $args['content'] ) ) {
			$content = &$args['content'];
		} else {
			$content = false;
		}

		if ( ! empty( $args['options'] ) ) {
			$options = &$args['options'];
		} else {
			$options = false;
		}

		global $wp_query;

		$default_query_args = [
			'post_type'     => 'team',
			'no_found_rows' => true,
			'post_status'   => 'publish',
			'fields'        => 'ids',
			'order_by'      => 'menu_order',
		];

		if ( ! empty( $content['departments'] ) ) {
			$departments_query = ( new WP_Query( array_merge( $default_query_args, [
				'tax_query' => [
					'taxonomy' => 'department',
					'field'    => 'term_id',
					'terms'    => $content['departments']
				]
			] ) ) )->posts ?? [];
		}

		$archive_member_ids = get_post_type() !== 'team' ? [] : wp_list_pluck( $wp_query->posts ?? [], 'ID' );

		$team_members_ids = array_values( array_filter( array_unique( array_merge(
			$departments_query ?? [],
			$content['team_members'] ?? $archive_member_ids ?? [],
		) ) ) ) ?: ( new WP_Query( $default_query_args ) )->posts ?? [];

		$departments = empty( $options['show_departments'] ) ? false :
			get_terms( [
				'taxonomy'      => 'department',
				'hide_empty'    => true,
				'no_found_rows' => true,
				'orderby'       => 'menu_order'
			] );

		$taxonomy = $departments ? get_taxonomy( 'department' ) : false;

		if ( ! empty( $options['sort_list'] ) ) {
			usort( $team_members_ids, function ( $a, $b ) {
				return strcmp( get_the_title( $a ), get_the_title( $b ) );
			} );
			usort( $team_members_ids, function ( $a, $b ) {
				$term_a = get_the_terms( $a, 'department' )[0]->name ?? false;
				$term_b = get_the_terms( $b, 'department' )[0]->name ?? false;

				return strcmp( $term_a, get_the_title( $term_b ) );
			} );
		}

		$team_members = self::get( $team_members_ids );

		$page_size = ! empty( $options['paginate'] ) ?
			min( ( $options['page_size'] ?? get_option( 'posts_per_page' ) ), 20 ) :
			count( $team_members );

		if ( empty( $team_members ) ) {
			return [];
		}

		$grid_selector = implode( ' ', array_filter( [
			'divlabs-team-grid',
			'divlabs-team-grid--' . ( $args['type'] ?? 'default' ),
			( ! empty( $options['stylized_images'] ) ? 'divlabs-team-stylized' : null ),
			$args['class'] ?? null,
		] ) );

		$nav_selector = implode( ' ', array_filter( [
			'divlabs-team-grid-nav divlabs-scrollbooster',
			! empty( $args['class'] ) ? join( '__', [ $args['class'], 'nav' ] ) : null,
		] ) );

		$list_selector = implode( ' ', array_filter( [
			'divlabs-team-grid__list',
			! empty( $args['class'] ) ? join( '__', [ $args['class'], 'list' ] ) : null,
			$args['list_selector'] ?? null
		] ) );

		return [
			'selector'      => $grid_selector,
			'departments'   => $departments,
			'nav_selector'  => $nav_selector,
			'taxonomy'      => $taxonomy,
			'list_selector' => $list_selector,
			'page_size'     => $page_size,
			'team_members'  => $team_members,
			'options'       => $options,
		];
	}

	public static function grid( $args = [] ): void {

		$data = self::grid_data( $args );

		WPBS::component( 'parts/grid', $args['type'] ?? false, $data, false, self::$slug, false );

	}

	public static function grid_nav( $args = [] ): void {

		WPBS::component( 'parts/grid', 'nav', $args, false, self::$slug, false );

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
			echo '<div class="divlabs-team-member-profile w-fit max-w-full m-auto">';
			block_template_part( 'team-profile' );
			do_action( 'divlabs_ajax_block_properties' );
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
			$fields = WPBS::clean_array( array_filter( get_field( 'divlabs_details_general', $post_id ), function ( $k ) {
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

	public static function get( $ids = [], $terms = null, $query_args = [] ): array|WPBS_Team_Single {

		global $wp_query;

		$posts = is_post_type_archive( self::$slug ) || is_tax( self::$tax_slug ) && empty( $ids ) ? wp_list_pluck( $wp_query->posts, 'ID' ) : false;

		$post = is_singular( self::$slug ) && empty( $ids ) ? $wp_query->post->ID : false;

		$post_ids = $ids ?? $posts ?: $post ?: ( new WP_Query( array_merge( [], array_filter( [
			'post_type'     => self::$slug,
			'post__in'      => (array) $ids,
			'no_found_rows' => true,
			'tax_query'     => ! empty( $terms ) ? array(
				array(
					'taxonomy' => self::$tax_slug,
					'field'    => 'slug',
					'terms'    => $terms,
				)
			) : false
		] ), is_array( $query_args ) ? $query_args : [] ) ) )->posts ?? [];

		$team = array_map( function ( $post_id ) {
			return new WPBS_Team_Single( $post_id );
		}, (array) $post_ids );

		return is_array( $ids ) ? $team : $team[0] ?? $team;

	}


}

