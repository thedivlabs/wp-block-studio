<?php

final class WPBS_Icons {

	private static ?WPBS_Icons $instance = null;

	private function __construct() {

		// Collect icons from blocks
		add_filter( 'render_block_data', [ $this, 'collect_block_icons' ], 10, 2 );

		// Output CSS
		add_action( 'wp_head', [ $this, 'output_icons_stylesheet' ], 2 );
		add_action( 'admin_head', [ $this, 'output_icons_stylesheet' ], 40 );

		// Load editor/blocks CSS
		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_editor_stylesheet' ] );
		//add_action( 'enqueue_block_assets', [ $this, 'enqueue_editor_stylesheet' ] );
	}

	public static function init(): WPBS_Icons {
		return self::$instance ??= new self();
	}

	public function collect_block_icons( array $block, array $source_block ): array {

		if ( ! str_starts_with( $block['blockName'] ?? '', 'wpbs/' ) ) {
			return $block;
		}

		$names = array_filter(
			wp_list_pluck( $block['attrs']['wpbs-icons'] ?? [], 'name' ),
			fn( $n ) => is_string( $n ) && $n !== ''
		);

		if ( $names ) {
			/**
			 * Push icon names to a filter instead of saving them in the class.
			 * Other code (output) can pull from this filter dynamically.
			 */
			$names = array_values( array_unique( $names ) );
			add_filter( 'wpbs_collected_icon_names', fn( $collected ) => array_values( array_unique( array_merge( $collected ?? [], $names ) ) ) );
		}

		return $block;
	}

	public function enqueue_editor_stylesheet(): void {
		$names = $this->get_default_safelist();
		$names = array_merge( $names, $this->get_global_icon_names() );

		// Merge all collected block icons from the filter
		$collected = apply_filters( 'wpbs_collected_icon_names', [] );
		if ( ! empty( $collected ) ) {
			$names = array_merge( $names, $collected );
		}

		$names = array_values( array_unique( array_filter( array_map( 'trim', $names ) ) ) );
		sort( $names, SORT_STRING );

		$url = $this->build_url( $names );

		if ( $url ) {
			wp_enqueue_style(
				'wpbs-material-icons-editor-css',
				$url,
				[],
				'1.0'
			);
		}
	}

	private function get_global_icon_names(): array {
		$cached = get_transient( 'wpbs_global_icon_names' );
		if ( is_array( $cached ) ) {
			return $cached;
		}

		if ( ! function_exists( 'get_field' ) ) {
			return [];
		}

		$raw = get_field( 'theme_settings_api_material_icons', 'option' );
		if ( ! $raw ) {
			set_transient( 'wpbs_global_icon_names', [], DAY_IN_SECONDS );

			return [];
		}

		$names = array_filter( array_map( 'trim', explode( ',', str_replace( ' ', '', $raw ) ) ) );
		sort( $names, SORT_STRING );

		set_transient( 'wpbs_global_icon_names', $names, DAY_IN_SECONDS );

		return $names;
	}

	private function get_default_safelist(): array {
		$raw  = 'add,help,home,arrow_forward,arrow_back,play_circle';
		$list = array_filter( array_map( 'trim', explode( ',', $raw ) ) );
		sort( $list, SORT_STRING );


		return $list;
	}

	private function build_url( array $names ): ?string {
		if ( empty( $names ) ) {
			return null;
		}

		sort( $names, SORT_STRING );

		return sprintf(
			'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,200..500,0..1,0&icon_names=%s&display=swap',
			implode( ',', $names )
		);
	}

	public function output_icons_stylesheet(): void {
		$names = $this->get_default_safelist();
		$names = array_merge( $names, $this->get_global_icon_names() );

		// Merge collected icons from filter
		$collected = apply_filters( 'wpbs_collected_icon_names', [] );
		if ( ! empty( $collected ) ) {
			$names = array_merge( $names, $collected );
		}

		$names = array_values( array_unique( array_filter( array_map( 'trim', $names ) ) ) );
		if ( empty( $names ) ) {
			return;
		}

		$url = $this->build_url( $names );
		if ( $url ) {
			echo '<link onload="this.rel=\'stylesheet\'" type="text/css" rel="preload" as="style" href="' . esc_url( $url ) . '" crossorigin fetchpriority="high">' . "\n";
		}
	}

}