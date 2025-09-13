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
				'slug' => $platform['platform'] ?? false,
				'url'  => $platform['url'] ?? false,
			];
		}, $fields['platforms'] ?? $fields );

	}

	public function render( $name = false, $args = [] ): array|bool {

		if ( empty( $this->platforms ) ) {
			return false;
		}

		$services = block_core_social_link_services();

		foreach ( $this->platforms as $platform ) {

			$slug  = $platform->slug ?? false;
			$url   = $platform->url;
			$name  = $services[ $slug ]['name'] ?? false;
			$icon  = $services[ $slug ]['icon'] ?? false;
			$title = 'Connect with us on ' . ( $name ?: 'social media' );

			echo implode( "\r\n", array_filter( [
				'<a href="' . $url . '" title="' . $title . '" target="_blank">',
				str_replace( [ 'width="24"', 'height="24"', '>' ], [
					'',
					'',
					'style="width:1em;height:1em;fill:currentColor;" >'
				], $icon ),
				'<span class="screen-reader-text">' . $name . '</span>',
				'</a>',
			] ) );
		}

		return true;
	}


}