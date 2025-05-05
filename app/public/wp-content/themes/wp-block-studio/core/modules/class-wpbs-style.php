<?php

class WPBS_Style {

	private static WPBS_Style $instance;

	private function __construct() {

	}

	public static function init(): WPBS_Style {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Style();
		}

		return self::$instance;
	}

}


