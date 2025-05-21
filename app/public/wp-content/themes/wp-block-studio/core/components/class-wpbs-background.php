<?php

class WPBS_Background {

	private static WPBS_Background $instance;

	private function __construct() {

		add_filter( 'render_block_data', [ $this, 'set_block_data' ], 10, 1 );


	}

	public function set_block_data( $block ): array {




		return $block;
	}


	public static function init(): WPBS_Background {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Background();
		}

		return self::$instance;
	}

}


