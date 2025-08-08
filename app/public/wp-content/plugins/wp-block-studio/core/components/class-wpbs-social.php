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
				'icon' => $platform['icon'] ?? false,
				'name' => $platform['name'] ?? false,
				'url'  => $platform['url'] ?? false,
			];
		}, $fields['platforms'] ?? $fields );

	}

	public function render( $name = false, $args = [] ): array|bool {

		if ( empty( $this->platforms ) ) {
			return false;
		}

		$class = implode( ' ', array_filter( [
			'wpbs-social-grid',
			( $name === true ? 'wpbs-social-grid--name' : null ),
			$args['class'] ?? null,
		] ) );

		echo '<div class="' . $class . '">';

		foreach ( $this->platforms as $platform ) {

			$title = 'Connect with us on ' . ( $platform->name ?: 'social media' );

			echo implode( "\r\n", array_filter( [
				'<a href="' . $platform->url . '" title="' . $title . '" target="_blank">',
				$platform->icon ?: null,
				'<span class="' . ( $name ? 'block' : 'screen-reader-text' ) . '">' . $platform->name . '</span>',
				'</a>',
			] ) );
		}

		echo '</div>';

		return true;
	}


}