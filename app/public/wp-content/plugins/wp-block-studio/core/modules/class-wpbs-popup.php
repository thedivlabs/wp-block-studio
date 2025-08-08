<?php


class WPBS_Popup {

	private static WPBS_Popup $instance;
	private string $singular;
	private string $plural;
	public static string $slug;
	public array $current;
	public array $options;
	public array|bool $settings;
	public static bool $enabled;
	private object $transients;

	private function __construct() {

		$this->singular = 'Pop-up';
		$this->plural   = 'Pop-ups';
		self::$slug     = 'popup';

		$this->transients = (object) [
			'query' => implode( '_', [ 'wpbs_popups_query', get_queried_object_id() ] )
		];

		WPBS_CPT::register( $this->singular, $this->plural, self::$slug, [
			'menu_icon'     => 'dashicons--popups',
			'menu_position' => 25,
			'supports'      => [
				'title',
				'attributes',
				'editor'
			]
		], false, true, false, true, false );


		$this->define_vars();
		$this->set_current();

		add_action( 'wpbs_init', [ $this, 'init_vars' ] );
		add_filter( 'manage_' . self::$slug . '_posts_columns', [ $this, 'set_admin_columns' ], 100 );
		add_action( 'manage_' . self::$slug . '_posts_custom_column', [ $this, 'populate_admin_columns' ], 10, 2 );
		add_filter( 'wpbs_init_vars', [ $this, 'output_vars' ] );

		add_action( 'wp_footer', [ $this, 'output_container' ], 10 );

		add_action( 'wp_head', [ $this, 'parse_template' ], 1 );

	}

	public function parse_template(): void {

		foreach ( $this->current ?? [] as $popup ) {

			if ( ! is_a( $popup, 'WPBS_Popup_Single' ) ) {
				continue;
			}

			$id         = "wpbs-popup-$popup->id";
			$class_slug = sanitize_title( get_the_title( $popup->id ) );
			$class      = "wpbs-popup wpbs-popup--$class_slug max-w-full m-auto w-auto flex justify-center items-center";

			$content = get_the_content( null, null, $popup->id );
			//$content = apply_filters( 'the_content', $content );
			//$content = str_replace( ']]>', ']]&gt;', $content );
			$blocks = do_blocks( $content );

			add_action( 'wpbs_popup_content', function () use ( $blocks, $popup, $class, $id ) {
				echo "<div id='$id' data-id='$popup->id' class='$class'>";

				echo $blocks;

				echo '</div>';
			} );
		}

	}

	public function init_vars(): void {

	}

	public function output_container(): void {
		echo '<div class="wpbs-popup-templates hidden" id="wpbs-popup-templates">';
		do_action( 'wpbs_popup_content' );
		echo '</div>';
	}

	public function define_vars(): void {

		$this->settings = [];
		self::$enabled  = true;
	}

	public function set_current(): void {

		if ( ! self::$enabled ) {
			return;
		}

		$query_args = [
			'post_type'     => self::$slug,
			'fields'        => 'ids',
			'no_found_rows' => true,
			'meta_query'    => [
				'relation' => 'AND',
				[
					'key'     => 'wpbs_options_enabled',
					'value'   => true,
					'compare' => '='
				],
				[
					'relation' => 'OR',
					[
						'key'     => 'wpbs_general_type',
						'value'   => 'sitewide',
						'compare' => '='
					],
					[
						'relation' => 'AND',
						[
							'key'     => 'wpbs_general_type',
							'value'   => 'page',
							'compare' => '='
						],
						[
							'key'     => 'wpbs_general_pages',
							'value'   => get_queried_object_id(),
							'compare' => 'LIKE'
						],
					]
				]

			]
		];

		if ( empty( get_transient( $this->transients->query ) ) ) {


			$transient_data = ( new WP_Query( $query_args ) )->posts ?? [];

			if ( ! empty( $transient_data ) ) {
				set_transient( $this->transients->query, $transient_data, DAY_IN_SECONDS );
			}

		}

		$post_ids = get_transient( $this->transients->query );

		foreach ( $post_ids ?: [] as $post_id ) {
			$popup = new WPBS_Popup_Single( $post_id );

			if (
				( $popup->target == 'utm' && $_GET[ $popup->utm_parameter ] ?? false !== $popup->utm_value ) ||
				( $popup->target == 'user' && ! is_user_logged_in() ) ||
				( $popup->target == 'visitor' && is_user_logged_in() )
			) {
				continue;
			}
			$this->current[] = $popup;
		}

	}

	public function output_vars( $vars ): array {


		if ( ! empty( $this->current ) ) {
			$vars['popups'] = $this->current;
		}

		return $vars;

	}

	public function set_admin_columns( $columns ) {
		foreach (
			array_filter( array_keys( $columns ), function ( $col_key ) {
				return str_contains( $col_key, 'wpseo-' );
			} ) as $col
		) {
			unset( $columns[ $col ] );
		}

		unset( $columns['date'] );

		$columns['status'] = __( 'Status', 'wpbs' );
		$columns['target'] = __( 'Target', 'wpbs' );

		return $columns;
	}

	public function populate_admin_columns( $column, $post_id ): void {
		switch ( $column ) {
			case 'status' :
				$status = get_field( 'wpbs_options_enabled', $post_id ) ?? false;
				if ( $status === true ) {
					echo 'Active';
				} else {
					echo 'Disabled';
				}

				break;
			case 'target' :

				echo ucwords( get_field( 'wpbs_general_target', $post_id ) );

				break;
		}
	}

	public static function init(): WPBS_Popup {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Popup();
		}

		return self::$instance;
	}

}


class WPBS_Popup_Single {

	public int|bool $id;
	public string $type;
	public string $trigger;
	public string|bool $click_selector;
	public array $pages;
	public string $frequency;
	public string $target;
	public string|bool $utm_parameter;
	public string|bool $utm_value;
	public bool $enabled;
	public int $delay;
	public string|bool $background_color;
	public bool $cta;

	public function __construct( $post ) {

		$this->id = is_a( $post, 'WP_Post' ) ? $post->ID : (int) $post;

		$fields = WPBS::get_transient( 'wpbs', 'popup', $this->id );

		$this->type             = $fields['type'] ?? 'sitewide';
		$this->trigger          = $fields['trigger'] ?? 'cta';
		$this->click_selector   = $fields['click_selector'] ?? false;
		$this->pages            = $fields['pages'] ?? [];
		$this->frequency        = $fields['frequency'] ?? false;
		$this->target           = $fields['target'] ?? 'all';
		$this->utm_parameter    = $fields['utm_parameter'] ?? false;
		$this->utm_value        = $fields['utm_value'] ?? false;
		$this->enabled          = ! empty( $fields['enabled'] );
		$this->delay            = $fields['delay'] ?? 0;
		$this->background_color = $fields['background_color'] ?? false;
		$this->cta              = $this->type === 'cta';

	}

}

