<?php


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

		$this->type             = WPBS::get_transient( 'wpbs_general_type', 'popup', $this->id ) ?: 'sitewide';
		$this->trigger          = WPBS::get_transient( 'wpbs_general_trigger', 'popup', $this->id ) ?: 'cta';
		$this->click_selector   = WPBS::get_transient( 'wpbs_general_click_selector', 'popup', $this->id ) ?: false;
		$this->pages            = WPBS::get_transient( 'wpbs_general_pages', 'popup', $this->id ) ?: [];
		$this->frequency        = WPBS::get_transient( 'wpbs_general_frequency', 'popup', $this->id ) ?: false;
		$this->target           = WPBS::get_transient( 'wpbs_general_target', 'popup', $this->id ) ?: 'all';
		$this->utm_parameter    = WPBS::get_transient( 'wpbs_general_utm_parameter', 'popup', $this->id ) ?: false;
		$this->utm_value        = WPBS::get_transient( 'wpbs_general_utm_value', 'popup', $this->id ) ?: false;
		$this->enabled          = ! empty( WPBS::get_transient( 'wpbs_options_enabled', 'popup', $this->id ) );
		$this->delay            = WPBS::get_transient( 'wpbs_options_delay', 'popup', $this->id ) ?: 0;
		$this->background_color = WPBS::get_transient( 'wpbs_options_background_color', 'popup', $this->id ) ?: false;
		$this->cta              = $this->type === 'cta';

	}

}

