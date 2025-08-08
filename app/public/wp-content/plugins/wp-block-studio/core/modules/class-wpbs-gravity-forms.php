<?php


class WPBS_Gravity_Forms {

	private static WPBS_Gravity_Forms $instance;


	private function __construct() {

		add_filter( 'gform_confirmation_anchor', '__return_false' );

		add_filter( 'gform_next_button', [ $this, 'input_to_button' ], 10, 2 );
		add_filter( 'gform_previous_button', [ $this, 'input_to_button' ], 10, 2 );
		add_filter( 'gform_submit_button', [ $this, 'input_to_button' ], 10, 2 );
		add_action( 'gform_after_submission', [ $this, 'send_crm_lead' ], 10, 2 );
		add_action( 'gform_after_submission', [ $this, 'check_entry_creation' ], 40, 2 );
		add_filter( 'gform_form_settings_fields', [ $this, 'custom_form_options' ], 10, 2 );

	}

	public function send_crm_lead( $entry, $form ): void {
		$options = get_field( "crm", "option" );
		if ( is_array( $options ) && ! empty( $options ) ) {
			$endpoints = [];
			$sub       = [];
			foreach ( $form["fields"] as $field ) {
				$sub[ $field->label ] = $entry[ $field->id ];
			}
			foreach ( $options as $k => $opt ) {
				if ( empty( $opt['enabled'] ) ) {
					continue;
				}
				if ( in_array( $form["id"], $opt["forms"] ) ) {
					$endpoints[] = $opt["endpoint"];
				}
			}
			if ( is_array( $endpoints ) && ! empty( $endpoints ) ) {
				foreach ( $endpoints as $ep ) {
					wp_remote_post( $ep, array( 'body' => $sub ) );
				}
			}
		}

	}

	public function input_to_button( $button, $form ): string {
		$fragment = WP_HTML_Processor::create_fragment( $button );
		$fragment->next_token();

		$classes = implode( ' ', array_merge( explode( ' ', $fragment->get_attribute( 'class' ) ), [
			'wpbs-btn'
		] ) );

		$fragment->set_attribute( 'class', $classes );

		$attributes     = [ 'id', 'type', 'class', 'onclick' ];
		$new_attributes = [];

		foreach ( $attributes as $attribute ) {
			$value = $fragment->get_attribute( $attribute );
			if ( ! empty( $value ) ) {
				$new_attributes[] = sprintf( '%s="%s"', $attribute, esc_attr( $value ) );
			}
		}

		return sprintf( '<button %s>%s</button>', implode( ' ', $new_attributes ), esc_html( $fragment->get_attribute( 'value' ) ) );
	}

	public function custom_form_options( $fields, $form ): array {

		$fields['form_options']['fields'][] = array(
			'type'  => 'toggle',
			'name'  => 'disable_entry',
			'label' => 'Disable Entry'
		);

		return $fields;
	}

	public function check_entry_creation( $entry, $form ): void {
		if ( ! empty( $form['disable_entry'] ) ) {
			GFAPI::delete_entry( $entry['id'] ?? false );
		}
	}


	public static function init(): WPBS_Gravity_Forms {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Gravity_Forms();
		}

		return self::$instance;
	}

}