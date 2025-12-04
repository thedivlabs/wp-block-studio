<?php

final class WPBS_Icons {

	private static ?WPBS_Icons $instance = null;
	private array $icons = [];

	private function __construct() {

		add_filter( 'render_block_data', [ $this, 'collect_block_icons' ], 10, 2 );

		add_action( 'wp_head', [ $this, 'output_icons_stylesheet' ], 2 );
		add_action( 'admin_head', [ $this, 'output_icons_stylesheet' ], 40 );

		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_editor_stylesheet' ] );
	}

	public function enqueue_editor_stylesheet(): void {
		$names = $this->get_default_safelist();
		$names = array_merge( $names, $this->get_global_icon_names() );

		// Note: Block icons are not yet collected at this point,
		// but the global/safelist icons are essential for the editor.

		$url = $this->build_url( $names );

		if ( $url ) {
			wp_enqueue_style(
				'wpbs-material-icons-editor-css',
				$url,
				[], // No dependencies
				'1.0' // Use a static version number for editor assets
			);
		}
	}

	public static function init(): WPBS_Icons {
		return self::$instance ??= new self();
	}

	/* --------------------------------------------------------------
	 * BLOCK COLLECTION
	 * -------------------------------------------------------------- */

	public function collect_block_icons( array $block, array $source_block ): array {

		if ( ! str_starts_with( $block['blockName'] ?? '', 'wpbs/' ) ) {
			return $block;
		}

		$names = array_filter(
			wp_list_pluck( $block['attrs']['wpbs-icons'] ?? [], 'name' ),
			fn( $n ) => is_string( $n ) && $n !== ''
		);

		if ( $names ) {
			$this->icons = array_unique( array_merge( $this->icons, $names ) );
		}

		return $block;
	}

	/* --------------------------------------------------------------
	 * GLOBAL ICONS
	 * -------------------------------------------------------------- */

	private function get_global_icon_names(): array {

		if ( ! empty( $_GET['wpbs-debug'] ) ) {
			delete_transient( 'wpbs_global_icon_names' );
		}

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

		$names = array_filter(
			array_map(
				'trim',
				explode( ',', str_replace( ' ', '', $raw ) )
			)
		);

		$names = array_values( array_unique( $names ) );
		sort( $names, SORT_STRING );

		set_transient( 'wpbs_global_icon_names', $names, DAY_IN_SECONDS );

		return $names;
	}

	/* --------------------------------------------------------------
	 * SAFELIST
	 * -------------------------------------------------------------- */

	private function get_default_safelist(): array {

		//$raw = 'keyboard_arrow_down,keyboard_arrow_up,circle,account_box,account_circle,add,add_box,add_circle,alarm,album,analytics,api,archive,arrow_back,arrow_drop_down,arrow_drop_up,arrow_forward,art_track,assessment,attach_file,attach_file_off,attach_money,auto_fix_high,auto_fix_normal,auto_fix_off,bar_chart,battery_charging_full,battery_full,bedtime,block,bluetooth,bookmark,bookmark_border,brightness_5,brightness_6,brightness_7,brush,bug_report,build,cafe,calendar_today,camera,camera_alt,camera_roll,cancel,cast,chat,check,close,cloud,cloud_download,cloud_upload,code,coffee,construction,content_copy,content_cut,content_paste,credit_card,data_usage,delete,description,desktop_windows,directions_bike,directions_bus,directions_car,directions_walk,donut_large,drag_indicator,edit,edit_note,email,emoji_events,error,expand_less,expand_more,extension,fast_forward,fast_rewind,fastfood,favorite,fiber_manual_record,fiber_new,fiber_smart_record,file_download,file_upload,filter_list,fingerprint,first_page,fitness_center,flash_off,flash_on,flight,folder,folder_open,format_align_center,format_align_left,format_align_right,format_bold,format_italic,format_list_bulleted,format_list_numbered,format_underline,forum,fullscreen,fullscreen_exit,gamepad,gavel,gpp_bad,gpp_good,graphic_eq,group,groups,headphones,headset,headset_mic,help,help_outline,home,image,info,joystick,keyboard,keyboard_arrow_down,keyboard_arrow_left,keyboard_arrow_right,keyboard_arrow_up,language,laptop,last_page,lightbulb,line_chart,link,local_bar,local_cafe,local_grocery_store,local_hospital,local_pizza,local_shipping,location_on,lock,loop,loyalty,lunch_dining,manage_accounts,map,menu,mic,mic_none,mode_comment,money,more_horiz,more_vert,mouse,movie,navigate_before,navigate_next,nightlight,notifications,palette,pause,pause_circle,payments,person,phone,phonelink,photo,photo_camera,pie_chart,play_arrow,play_circle,playlist_add,playlist_play,policy,post_add,present_to_all,print,public,push_pin,question_mark,redo,refresh,remove,remove_circle,remove_circle_outline,restaurant,rocket_launch,router,scanner,schedule,school,search,security,send,settings,share,shield,shopping_bag,shopping_basket,shopping_cart,shopping_cart_checkout,show_chart,skip_next,skip_previous,sort,speaker,sports_esports,star,star_half,sticky_note_2,stop,stop_circle,store,storefront,subway,support,support_agent,swap_horiz,swap_vert,sync,sync_alt,tablet,terminal,text_snippet,thermostat,thumb_down,thumb_up,timer,train,translate,trending_down,trending_flat,trending_up,tv,unarchive,undo,video_camera_front,videocam,visibility,visibility_off,volume_down,volume_mute,volume_up,vpn_key,wb_sunny,webhook,widgets,wifi,work,zoom_in,zoom_out';
		$raw = 'help,home,arrow_forward,arrow_back';

		$list = array_filter(
			array_map( 'trim', explode( ',', $raw ) ),
			static fn( string $n ) => $n !== ''
		);

		$list = array_unique( apply_filters( 'wpbs_icon_safelist', $list ) );

		sort( $list, SORT_STRING );

		return $list;
	}

	/* --------------------------------------------------------------
	 * BUILD URL
	 * -------------------------------------------------------------- */

	private function build_url( array $names ): ?string {

		$names = array_values( array_unique( array_filter( $names ) ) );
		if ( empty( $names ) ) {
			return null;
		}

		sort( $names, SORT_STRING );

		return sprintf(
			'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,200..500,0..1,0&icon_names=%s&display=swap',
			implode( ',', $names )
		);
	}

	/* --------------------------------------------------------------
	 * OUTPUT
	 * -------------------------------------------------------------- */

	public function output_icons_stylesheet(): void {

		if ( is_feed() || is_robots() || is_trackback() ) {
			return;
		}

		$names = $this->get_default_safelist();

		// NEW: merge collected block icons
		if ( ! empty( $this->icons ) ) {
			$names = array_merge( $names, $this->icons );
		}

		$names = array_merge( $names, $this->get_global_icon_names() );

		$names = array_values( array_unique( array_filter( array_map( 'trim', $names ) ) ) );

		if ( empty( $names ) ) {
			return;
		}

		$url = $this->build_url( $names );
		if ( $url ) {
			echo '<link rel="stylesheet" id="wpbs-material-icons-css" data-href="' . esc_url( $url ) . '">' . "\n";
		}

		echo '<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>' . "\n";
		echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
	}

}
