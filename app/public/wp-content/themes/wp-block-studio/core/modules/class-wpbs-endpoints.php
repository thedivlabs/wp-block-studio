<?php

class WPBS_Endpoints {

	private static WPBS_Endpoints $instance;

	public static string $namespace = 'wpbs/v2';

	private static array $default;

	private function __construct() {

		self::$default = [
			'methods'             => 'GET',
			'callback'            => false,
			'permission_callback' => '__return_true'
		];

	}

	public static function add( $route, $pattern, $args ): void {
		add_action( 'rest_api_init', function () use ( $route, $pattern, $args ) {
			register_rest_route( self::$namespace, "/{$route}/{$pattern}", array_merge( self::$default, (array) $args ) );
		} );
	}

	public static function init(): WPBS_Endpoints {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Endpoints();
		}

		return self::$instance;
	}
}

