<?php


class DIVLABS_Google_Places {

	private static DIVLABS_Google_Places $instance;
	private string|bool $google_api_key;
	private string|bool $google_maps_key;

	private function __construct() {

		$this->init_class();
		add_filter( 'divlabs_init_vars', [ $this, 'init_vars' ] );

	}

	public function init_vars( $vars ): array {
		$vars['google_places'] = [
			'token'    => wp_create_nonce( 'divlabs_google_places' ),
			'key'      => $this->google_api_key,
			'style_id' => $this->google_maps_key,
		];

		return $vars;
	}

	public function init_class(): void {

		$this->google_api_key  = get_field( 'divlabs_advanced_settings_api_google_api_key', 'option' ) ?? false; // secret key
		$this->google_maps_key = get_field( 'divlabs_advanced_settings_api_google_maps_key', 'option' ) ?? false; // open key

		DIVLABS_Endpoints::add( 'place-details', false, [
			'methods'  => 'GET',
			'callback' => [ $this, 'fetch_place_details' ]
		] );
	}

	public function fetch_place_details( WP_REST_Request $request ): array {

		$place_id  = sanitize_text_field( $request['place_id'] );
		$place_ids = array_map( function ( $loc_id ) {
			return get_field( 'divlabs_map_google_place_id', $loc_id );
		}, ( new WP_Query( [
			'post_type'      => 'company',
			'post_status'    => 'publish',
			'no_found_rows'  => true,
			'posts_per_page' => - 1,
			'fields'         => 'ids'
		] ) )->posts );

		if (
			! $this->google_api_key ||
			! in_array( $place_id, $place_ids )
		) {
			die( json_encode( [
				'status' => 0
			] ) );
		}

		$fields = implode( ',', [
			'photos',
			'reviews',
			'geometry',
			'name',
			'address_components',
			'formatted_phone_number',
			'opening_hours',
			'icon',
			'icon_mask_base_uri',
			'photo',
			'type',
			'url',
			'secondary_opening_hours',
			'user_ratings_total',
			'rating',
		] );

		$path = "https://maps.googleapis.com/maps/api/place/details/json?key={$this->google_api_key}&place_id={$place_id}&fields={$fields}";

		$curl = curl_init();

		curl_setopt_array( $curl, array(
			CURLOPT_URL            => $path,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_ENCODING       => '',
			CURLOPT_MAXREDIRS      => 10,
			CURLOPT_TIMEOUT        => 0,
			CURLOPT_FOLLOWLOCATION => true,
			CURLOPT_HTTP_VERSION   => CURL_HTTP_VERSION_1_1,
			CURLOPT_CUSTOMREQUEST  => 'GET',
		) );

		$response = json_decode( curl_exec( $curl ), true )['result'];

		curl_close( $curl );

		$qs = [];
		parse_str( parse_url( $response['url'] ?? '', PHP_URL_QUERY ), $qs );
		$cid = array_values( $qs )[0] ?? false;

		$details = array_filter( [
			'phone'          => $response['formatted_phone_number'] ?? str_replace( [ '+1 ' ], null, $response['international_phone_number'] ?? null ),
			'lat'            => $response['geometry']['location']['lat'] ?? null,
			'lng'            => $response['geometry']['location']['lng'] ?? null,
			'url_directions' => 'https://www.google.com/maps/dir/Current+Location/' .
			                    ( implode( ',', [
				                    $response['geometry']['location']['lat'],
				                    $response['geometry']['location']['lng'],
			                    ] ) ),
			'cid'            => $cid,
			'url_map'        => $response['url'] ?? null,
			'hours'          => array_merge( ...array_filter( array_map( function ( $hours ) {

				$day = '';
				switch ( $hours['open']['day'] ) {
					case 1:
						$day = 'monday';
						break;
					case 2:
						$day = 'tuesday';
						break;
					case 3:
						$day = 'wednesday';
						break;
					case 4:
						$day = 'thursday';
						break;
					case 5:
						$day = 'friday';
						break;
					case 6:
						$day = 'saturday';
						break;
					case 7:
						$day = 'sunday';
						break;
				}

				return ! empty( $hours['open']['time'] ) && ! empty( $hours['close']['time'] ) ? [
					$day => [
						'open'  => date( 'g:i a', strtotime( $hours['open']['time'][0] . $hours['open']['time'][1] . ':' . $hours['open']['time'][2] . $hours['open']['time'][3] ) ),
						'close' => date( 'g:i a', strtotime( $hours['close']['time'][0] . $hours['close']['time'][1] . ':' . $hours['close']['time'][2] . $hours['close']['time'][3] ) ),
					]
				] : null;
			}, $response['opening_hours']['periods'] ?? [] ) ) ),
			'location'       => array_merge( ...array_filter( array_map( function ( $comp ) {
				if ( ! empty( array_intersect( $comp['types'], [ 'street_number' ] ) ) ) {
					return [ 'street_number' => $comp['short_name'] ?? false ];
				}
				if ( ! empty( array_intersect( $comp['types'], [ 'street_address', 'route' ] ) ) ) {
					return [ 'street' => $comp['short_name'] ?? false ];
				}
				if ( ! empty( array_intersect( $comp['types'], [ 'subpremise' ] ) ) ) {
					return [ 'address_2' => $comp['short_name'] ?? false ];
				}
				if ( ! empty( array_intersect( $comp['types'], [
					'locality',
					'sublocality',
					'sublocality_level_1',
					'sublocality_level_2',
					'sublocality_level_3',
					'sublocality_level_4'
				] ) ) ) {
					return [ 'city' => $comp['short_name'] ?? false ];
				}
				if ( ! empty( array_intersect( $comp['types'], [ 'administrative_area_level_1' ] ) ) ) {
					return [ 'state' => $comp['short_name'] ?? false ];
				}
				if ( ! empty( array_intersect( $comp['types'], [ 'postal_code' ] ) ) ) {
					return [ 'zip' => $comp['short_name'] ?? false ];
				}

				return false;
			}, $response['address_components'] ?? [] ) ) )
		] );


		if (
			! empty( $details['location']['street_number'] ) ||
			! empty( $details['location']['street'] )
		) {
			$details['location']['address_1'] =
				trim(
					implode( ' ',
						array_filter( [
							$details['location']['street_number'] ?? null,
							$details['location']['street'] ?? null
						] )
					)
				);
		}

		unset( $details['location']['street_number'], $details['location']['street'] );

		if ( ! empty( $_GET['post_id'] ) ) {
			foreach ( $response['reviews'] ?? [] as $review ) {

				$review_exists = (bool) get_comments( [
					'meta_key'   => 'timestamp',
					'meta_value' => $review['time'],
					'count'      => true
				] );

				if (
					$review_exists ||
					$review['rating'] < 4
				) {
					continue;
				}

				$date = date( 'Y-m-d H:i:s', $review['time'] ?? '' );

				wp_insert_comment( [
					'comment_post_ID'    => $_GET['post_id'],
					'comment_author'     => $review['author_name'],
					'comment_author_url' => $review['author_url'],
					'comment_content'    => $review['text'],
					'comment_date'       => $date,
					'comment_date_gmt'   => $date,
					'comment_approved'   => 1,
					'comment_type'       => 'google_review',
					'comment_meta'       => [
						'rating'    => $review['rating'],
						'avatar'    => $review['profile_photo_url'],
						'timestamp' => $review['time']
					]
				] );
			}
		}

		return $details;
	}

	public static function init(): DIVLABS_Google_Places {
		if ( empty( self::$instance ) ) {
			self::$instance = new DIVLABS_Google_Places();
		}

		return self::$instance;
	}


}