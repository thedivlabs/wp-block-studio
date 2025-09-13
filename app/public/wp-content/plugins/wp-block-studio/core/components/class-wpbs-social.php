<?php


class WPBS_Social {

	public array $platforms;

	function __construct( $fields = [] ) {

		$fields = WPBS::clean_array( $fields );

		if ( empty( $fields ) ) {
			return;
		}


		$this->platforms = array_map( function ( $platform ) {

			return (object) [
				'slug'  => is_array( $platform['platform'] ?? false ) ? $platform['platform'][0] ?? false : $platform['platform'] ?? false,
				'url'   => $platform['url'] ?? false,
				'image' => $platform['image'] ?? false,
			];
		}, $fields['platforms'] ?? $fields );

	}

	public function render( $args = [] ): array|bool {

		if ( empty( $this->platforms ) ) {
			return false;
		}

		$services = block_core_social_link_services();

		foreach ( $this->platforms as $platform ) {

			$slug   = $platform->slug ?? 0;
			$url    = esc_url( $platform->url );
			$name   = $services[ $platform->slug ]['name'] ?? '';
			$file   = get_attached_file( $platform->image );
			$is_svg = strtolower( pathinfo( $file ?: '', PATHINFO_EXTENSION ) ) === 'svg';
			$title  = esc_attr( 'Connect with us on ' . ( $name ?: 'social media' ) );


			echo implode( "\r\n", array_filter( [
				'<a href="' . $url . '" title="' . $title . '" target="_blank">',
				$is_svg ? file_get_contents( $file ) : str_replace( [
					'width="24"',
					'height="24"'
				], '', ( $services[ $slug ]['icon'] ?? '' ) ),
				'<span class="screen-reader-text">' . $name . '</span>',
				'</a>',
			] ) );
		}

		return true;
	}


}