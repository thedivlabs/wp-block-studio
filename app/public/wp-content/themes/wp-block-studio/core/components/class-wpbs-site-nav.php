<?php


class WPBS_Site_Nav {

	private static WPBS_Site_Nav $instance;

	public array $args;


	function __construct() {

		add_filter( 'default_wp_template_part_areas', [ $this, 'register_template_parts' ], 30 );
		add_action( 'wp_footer', [ $this, 'render_flyout' ], 50 );
	}

	public function register_template_parts( $areas ): array {

		return array_merge( [], $areas ?? [], [
			[
				'area'        => 'flyout-nav',
				'area_tag'    => 'nav',
				'label'       => __( 'Flyout Nav', 'wpbs' ),
				'description' => __( 'Flyout navigation template', 'wpbs' ),
				'icon'        => 'layout'
			]
		] );
	}

	public function render_flyout(): void {

		$class = implode( ' ', array_filter( [
			'wpbs-flyout-nav'
		] ) );

		$template = do_blocks( '<!-- wp:template-part {"slug":"flyout-nav","area":"flyout-nav", "tagName":"div", "className":"w-full h-full flex flex-col"} /-->' );

		echo '<div class="' . $class . '">';
		echo '<div class="wpbs-flyout-nav__container">';
		echo do_blocks( $template );
		echo '</div>';
		echo '</div>';


	}

	public function init_vars(): void {

	}

	public static function init(): WPBS_Site_Nav {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Site_Nav();
		}

		return self::$instance;
	}

}