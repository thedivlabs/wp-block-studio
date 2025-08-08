<?php


class WPBS_Company {

	private static WPBS_Company $instance;

	public static WPBS_Place $primary;
	public static int|bool|null|string $primary_id;
	public static string $slug;

	public static string $singular;
	public static string $plural;

	public static array $taxonomies;

	private function __construct() {

		self::$singular = 'Company';
		self::$plural   = 'Company Locations';
		self::$slug     = sanitize_title( self::$singular );


		self::$taxonomies['service_areas'] = [
			'singular'  => 'Service Area',
			'plural'    => 'Service Areas',
			'menu_name' => 'Service Areas',
			'slug'      => 'service-area',
		];

		self::$taxonomies['regions'] = [
			'singular'  => 'Region',
			'plural'    => 'Regions',
			'menu_name' => 'Regions',
			'slug'      => 'region',
		];

		$labels = [
			'menu_name' => 'Company',
			'all_items' => 'All Locations',
			'archives'  => 'Locations',
		];

		WPBS_CPT::register( self::$singular, self::$plural, self::$slug, [
			'menu_icon'     => 'dashicons--companies',
			'menu_position' => 25,
			'supports'      => [
				'title',
				'editor',
				'excerpt',
				'thumbnail'
			],
			'has_archive'   => true,
			'taxonomies'    => array_map( 'sanitize_title', array_column( self::$taxonomies, 'slug' ) ),
			//'template'      => [ 'acf/wpbs-page-hero' ]
		], $labels, true );

		foreach ( self::$taxonomies as $tax ) {

			WPBS_Taxonomy::register( $tax['singular'], $tax['plural'], [
				self::$slug,
			], $tax['slug'], false, [
				'menu_name' => $tax['menu_name']
			] );
		}


		add_action( 'wpbs_init', [ $this, 'define_vars' ] );

	}

	public function define_vars(): void {
		self::$primary_id = get_field( 'company_options_general_primary', 'option' ) ?? false;
		self::$primary    = new WPBS_Place( self::$primary_id );

	}

	public static function service_areas( $company = false, $args = [] ): array|WP_Error|false|string {

		$company_id = ( $company->id ?? $company ) ?: self::$primary_id;

		if ( ! $company ) {

			return get_terms( array_filter( [
				'taxonomy'   => self::$taxonomies['service_areas']['slug'],
				'include'    => $args['ids'] ?? null,
				'hide_empty' => false,
			] ) );
		} else {
			return get_the_terms( $company_id, self::$taxonomies['service_areas']['slug'] );
		}
	}

	public static function init(): WPBS_Company {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Company();
		}

		return self::$instance;
	}

	public static function reviews( $company = false, $args = [] ): array {

		$company = $company ? new WPBS_Place( $company, $args ) : self::$primary;

		return get_comments( array_filter( [
			'post_ID' => empty( $args['all'] ) ? $company->id ?? null : null,
		] ) ) ?? [];

	}

	public static function map( $args = [] ): void {

		$class = implode( ' ', array_filter( [
			'wpbs-google-map',
			$args['class'] ?? null
		] ) );

		$companies = match ( true ) {
			empty( $args['company'] ) => self::$primary,
			is_a( $args['company'] ?? false, 'WPBS_Place' ) => $args['company'],
			is_int( $args['company'] ?? false ) => new WPBS_Place( $args['company'] ),
			is_array( $args['company'] ?? false ) => array_values( array_filter( array_map( function ( $company_id ) {
				return new WPBS_Place( $company_id );
			}, $args['company'] ) ) ),
			default => false
		};

		if ( ! $companies ) {
			return;
		}

		$map_data = [
			'options'   => (array) ( $args['options'] ?? [] ),
			'companies' => array_values( array_filter( array_map( function ( $company ) {
				if (
					! is_a( $company, 'WPBS_Place' ) ||
					empty( $company->latitude ) ||
					empty( $company->longitude )
				) {
					return null;
				}

				return [
					'latitude'   => $company->latitude,
					'longitude'  => $company->longitude,
					'marker_url' => $company->get_marker_url(),
					'map_url'    => $company->map_page,
					'id'         => $company->id,
					'place_id'   => $company->google_place_id,
					'name'       => $company->name,
					'is_primary' => $company->id == self::$primary_id,
				];
			}, is_array( $companies ) ? $companies : [ $companies ] ) ) )
		];

		echo "<figure class='$class' data-map='" . json_encode( $map_data ) . "'></figure>";


	}

}