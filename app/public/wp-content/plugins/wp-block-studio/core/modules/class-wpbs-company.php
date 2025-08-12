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


class WPBS_Place {

	public string|bool $name;
	public string|bool $slug;
	public int|bool $id;
	public int|bool $image;
	public array|bool $address;
	public array|bool $phone;
	public array|bool $phone_other;
	public array|bool $email;
	public array|bool $email_other;
	public array|bool $social;
	public array|bool $service_areas;
	public int|bool $marker;

	public string|bool $google_place_id;
	public string|bool $longitude;
	public string|bool $latitude;
	public string|bool $map_page;
	public string|bool $directions_page;
	public string|bool $reviews_page;
	public string|bool $new_review_url;

	public string|bool $hours_inline;


	function __construct( $id = false ) {

		$id                    = $id ?: WPBS_Company::$primary_id;
		$this->name            = get_the_title( $id );
		$this->image           = get_post_thumbnail_id( $id );
		$this->slug            = get_post_field( 'post_name', $id );
		$this->id              = $id;
		$this->google_place_id = get_field( 'wpbs_map_google_place_id', $id ) ?: false;
		$this->longitude       = get_field( 'wpbs_map_longitude', $id ) ?: false;
		$this->latitude        = get_field( 'wpbs_map_latitude', $id ) ?: false;
		$this->map_page        = get_field( 'wpbs_map_map_page_url', $id ) ?: false;
		$this->directions_page = get_field( 'wpbs_map_directions_page_url', $id ) ?: false;
		$this->new_review_url  = get_field( 'wpbs_map_new_review_url', $id ) ?: '';
		$this->reviews_page    = get_field( 'wpbs_map_reviews_url', $id ) ?: '';
		$this->address         = get_field( 'wpbs_address', $id ) ?: [];
		$this->phone           = get_field( 'wpbs_contact_phone_primary', $id ) ?: [];
		$this->phone_other     = WPBS::clean_array( get_field( 'wpbs_contact_phone_additional', $id ) ?: [] );
		$this->email           = get_field( 'wpbs_contact_email_primary', $id ) ?: false;
		$this->email_other     = WPBS::clean_array( get_field( 'wpbs_contact_email_additional', $id ) ?: [] );
		$this->social          = get_field( 'wpbs_social', $id ) ?: false;
		$this->marker          = get_field( 'wpbs_map_marker', $id ) ?: false;
		$this->service_areas   = [
			'title'     => get_field( 'wpbs_service_areas_title', $id ),
			'text'      => get_field( 'wpbs_service_areas_text', $id ),
			'locations' => function () {
				return self::get_service_areas( false, false );
			}
		];

		$this->hours_inline = get_field( 'wpbs_hours_inline', $id ) ?: false;

	}

	public function get_hours( $args = [], $render = true ): array|bool {
		$fields = WPBS::clean_array( get_field( 'wpbs_hours', $this->id ) );

		if ( empty( $fields ) ) {
			return false;
		}

		if ( ! empty( $args['inline'] ) ) {
			$inline_hours = $this->hours_inline;

			if ( empty( $inline_hours ) ) {
				return false;
			}

			if ( $render ) {
				echo $inline_hours;

				return true;
			} else {
				return $inline_hours;
			}
		}

		$hours = [
			'monday'    => [
				'title' => 'Monday',
				'open'  => $fields['monday_open'] ?? false,
				'close' => $fields['monday_close'] ?? false,
			],
			'tuesday'   => [
				'title' => 'Tuesday',
				'open'  => $fields['tuesday_open'] ?? false,
				'close' => $fields['tuesday_close'] ?? false,
			],
			'wednesday' => [
				'title' => 'Wednesday',
				'open'  => $fields['wednesday_open'] ?? false,
				'close' => $fields['wednesday_close'] ?? false,
			],
			'thursday'  => [
				'title' => 'Thursday',
				'open'  => $fields['thursday_open'] ?? false,
				'close' => $fields['thursday_close'] ?? false,
			],
			'friday'    => [
				'title' => 'Friday',
				'open'  => $fields['friday_open'] ?? false,
				'close' => $fields['friday_close'] ?? false,
			],
			'saturday'  => [
				'title' => 'Saturday',
				'open'  => $fields['saturday_open'] ?? false,
				'close' => $fields['saturday_close'] ?? false,
			],
			'sunday'    => [
				'title' => 'Sunday',
				'open'  => $fields['sunday_open'] ?? false,
				'close' => $fields['sunday_close'] ?? false,
			]
		];

		if ( $render ) {
			echo '<table class="' . ( implode( ' ', array_filter( [
					'wpbs-hours wpbs-table',
					$args['class'] ?? null
				] ) ) ) . '">';

			echo '<tr><th>Day</th><th>Open</th><th>Close</th></tr>';

			foreach ( $hours as $k => $day ) {

				if ( empty( $day['open'] ) && empty( $day['close'] ) ) {
					continue;
				}
				echo '<tr>';
				echo '<td>' . $day['title'] . '</td><td>' . ( $day['open'] ?? '-' ) . '</td><td>' . ( $day['close'] ?? '-' ) . '</td>';
				echo '</tr>';

			}

			echo '</table>';

			return true;
		}


		return $hours;
	}

	private function format_phone( $number = false ): string {
		return preg_replace( '~.*(\d{3})\D{0,7}(\d{3})\D{0,7}(\d{4}).*~', '($1) $2-$3', $number );
	}

	public function get_address( $args = [] ): string|bool {

		$line_separator = ( empty( $args['inline'] ) ? '<br />' : ', ' );
		$link_map       = ( $args['link_map'] ?? true ) !== false;
		$link_dir       = empty( $args['link_map'] ) && ! empty( $args['link_dir'] );
		$class          = implode( ' ', array_filter( [
			'wpbs-address',
			$args['class'] ?? null
		] ) );

		$address = implode( $line_separator, array_filter( [
			( '<span class="whitespace-nowrap">' . implode( ', ', array_filter( [
					$this->address['street'],
					empty( $args['split_address'] ) ? $this->address['number'] ?? null : null,
				] ) ) . '</span>' ),
			! empty( $args['split_address'] ) ? $this->address['number'] ?? null : null,
			( implode( ', ', array_filter( [
				$this->address['city'] ?? null,
				( implode( '&nbsp;', array_filter( [
					$this->address['state'] ?? null,
					$this->address['zip'] ?? null
				] ) ) )
			] ) ) )
		] ) );

		if ( $link_map || $link_dir ) {

			$address_string = implode( ', ', array_filter( [
				( implode( ', ', array_filter( [
					$this->address['street']
				] ) ) ),
				( implode( ', ', array_filter( [
					$this->address['city'] ?? null,
					( implode( ' ', array_filter( [
						$this->address['state'] ?? null,
						$this->address['zip'] ?? null
					] ) ) )
				] ) ) )
			] ) );

			if ( $link_dir ) {
				$link = $this->directions_page ?: 'https://www.google.com/maps/dir//' . urlencode( $address_string );
			} elseif ( $link_map ) {
				$link = $this->map_page ?: $this->directions_page;
			} else {
				$link = '#';
			}

			$address = implode( '', array_filter( [
				'<a href="' . $link . '" target="_blank" title="Get directions" class="' . $class . '">',
				$address,
				'</a>'
			] ) );
		}

		return $address;
	}

	public function get_phone( $args = [] ): string|array|false {

		$all    = $args['all'] ?? false;
		$others = $args['others'] ?? false;

		$all_phones = array_filter( array_map( function ( $phone ) use ( $args ) {

			if ( empty( $phone['number'] ) ) {
				return null;
			}

			$number = $this->format_phone( $phone['number'] );

			$link      = $args['link'] ?? true;
			$show_icon = $args['show_icon'] ?? false;
			$icon_only = $args['icon_only'] ?? false;
			$label     = $args['label'] ?? false;

			$class = implode( ' ', array_filter( [
				'wpbs-phone',
				$args['class'] ?? null
			] ) );

			return implode( ' ', array_filter( [
				$link ? '<a href="tel:' . $phone['number'] . '" class="' . $class . '">' : '<div class="' . $class . '">',
				$show_icon ? $phone['icon'] ?? null : null,
				! $icon_only && $label ? $phone['label'] ?? null : null,
				! $icon_only ? $number : null,
				$link ? '</a>' : '</div>',
			] ) );


		}, [ $this->phone, ...$this->phone_other ] ) );

		return match ( true ) {
			$others => array_slice( $all_phones, 1 ),
			$all => $all_phones,
			default => $all_phones[0] ?? false,
		};

	}

	public function get_email( $args = [] ): string|array|false {

		$all    = $args['all'] ?? false;
		$others = $args['others'] ?? false;

		$all_emails = array_filter( array_map( function ( $email ) use ( $args ) {

			if ( empty( $email['address'] ) ) {
				return null;
			}

			$link      = $args['link'] ?? true;
			$show_icon = $args['show_icon'] ?? false;
			$icon_only = $args['icon_only'] ?? false;
			$label     = $args['label'] ?? false;

			$class = implode( ' ', array_filter( [
				'wpbs-email',
				$args['class'] ?? null
			] ) );

			return implode( ' ', array_filter( [
				$link ? '<a href="mailto:' . $email['address'] . '" class="' . $class . '">' : '<div class="' . $class . '">',
				$show_icon ? $email['icon'] ?? null : null,
				! $icon_only && $label ? $email['label'] ?? null : null,
				! $icon_only ? $email['address'] : null,
				$link ? '</a>' : '</div>',
			] ) );


		}, [ $this->email, ...$this->email_other ] ) );

		return match ( true ) {
			$others => array_slice( $all_emails, 1 ),
			$all => $all_emails,
			default => $all_emails[0] ?? false,
		};

	}

	public function summary(): string|bool|null {
		return get_field( 'wpbs_content_description', $this->id );
	}

	public function get_service_areas( $args = [], $render = true ): array {

		$service_areas = WPBS_Company::service_areas( $this->id, $args );


		if ( $render && ! empty( $service_areas ) ) {
			echo '<ul class="' . implode( ' ', array_filter( [
					'wpbs-service-areas w-full flex flex-wrap gap-x-4 gap-y-1 justify-start items-center',
					$args['class'] ?? null
				] ) ) . '">';
			foreach ( $service_areas as $term ) {
				echo '<li class="' . implode( ' ', array_filter( [
						( false !== ( $args['icon'] ?? true ) ? 'before-check' : null )
					] ) ) . '">';
				if ( $args['link'] ?? true ) {
					echo '<a href="' . get_term_link( $term ) . '">';
				}
				echo $term->name;
				if ( $args['link'] ?? true ) {
					echo '</a>';
				}
				echo '</li>';
			}
			echo '</ul>';
		}


		return $service_areas ?: [];


	}

	public function get_marker_url(): string {
		return wp_get_attachment_url( $this->marker );
	}

}