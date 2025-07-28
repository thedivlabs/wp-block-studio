<?php

if (
	! defined( 'ABSPATH' ) ||
	! class_exists( 'ACF' )
) {
	exit;
}

class WPBS_ACF_field_select_cpt extends \acf_field {

	public $show_in_rest = true;

	public function __construct() {

		$this->name     = 'cpt_select';
		$this->label    = __( 'Post Type Select', 'WPBS' );
		$this->category = 'choice'; // basic | content | choice | relational | jquery | layout | CUSTOM GROUP NAME

		parent::__construct();
	}

	public function render_field_validation_settings( $field ): void {
		acf_render_field_setting(
			$field,
			array(
				'label' => __( 'Allow Null', 'WPBS' ),
				'type'  => 'true_false',
				'ui'    => 1,
				'name'  => 'allow_null',
			)
		);
	}

	public function render_field( $field ): void {

		$field = WPBS::clean_array( $field );

		$post_types = array_map( function ( $name ) {

			return get_post_type_object( $name );
		}, array_filter( array_values( get_post_types( [
			'public' => true
		] ) ), function ( $cpt ) {
			return ! in_array( $cpt, [
				'attachment'
			] );
		} ) );

		?>


        <select
                class="<?= implode( ' ', array_filter( [
					$field['wrapper']['class'] ?? $field['class'] ?? null
				] ) ) ?>"
                id="<?php echo esc_attr( $field['wrapper']['id'] ?? $field['id'] ?? null ) ?>"
                name="<?php echo esc_attr( $field['name'] ) ?>"
        >
			<?php if ( ! empty( $field['allow_null'] ) ) { ?>
                <option value="" selected="selected" data-i="0">- Select -</option>
			<?php } ?>

			<?php foreach ( $post_types as $cpt ) {
				if ( ! is_a( $cpt, 'WP_Post_Type' ) ) {
					continue;
				}

				?>
                <option value="<?= $cpt->name ?>"
					<?php echo ( $field['value'] ?? false ) == $cpt->name ? 'selected' : null ?>
                >
					<?php echo $cpt->label ?>
                </option>
			<?php } ?>

        </select>


		<?php
	}

}

class WPBS_ACF_field_select_form extends \acf_field {

	public $show_in_rest = true;

	public function __construct() {

		$this->name     = 'form_select';
		$this->label    = __( 'Form Select', 'WPBS' );
		$this->category = 'choice'; // basic | content | choice | relational | jquery | layout | CUSTOM GROUP NAME


		parent::__construct();
	}

	public function render_field_validation_settings( $field ) {
		acf_render_field_setting(
			$field,
			array(
				'label' => __( 'Allow Null', 'WPBS' ),
				'type'  => 'true_false',
				'ui'    => 1,
				'name'  => 'allow_null',
			)
		);
	}

	public function render_field( $field ) {

		if ( ! class_exists( 'GFForms' ) ) {
			return;
		}

		$choices = array_map( function ( $form ) {
			return [
				'id'    => $form['id'],
				'title' => $form['title']
			];
		}, array_merge( GFAPI::get_forms() ?? [], GFAPI::get_forms( false ) ?? [] ) );

		?>

        <select
                class="<?= implode( ' ', array_filter( [
					$field['wrapper']['class'] ?? $field['class'] ?? null
				] ) ) ?>"
                id="<?php echo esc_attr( $field['wrapper']['id'] ?? $field['id'] ?? null ) ?>"
                name="<?php echo esc_attr( $field['name'] ?? null ) ?>"
        >
			<?php if ( ! empty( $field['allow_null'] ) ) { ?>
                <option value="" selected="selected" data-i="0" value="">- Select -</option>
			<?php } ?>

			<?php foreach ( $choices as $form ) {
				if (
					empty( $form['id'] ) ||
					empty( $form['title'] )
				) {
					continue;
				}
				?>
                <option value="<?= $form['id'] ?>"
					<?php echo ( $field['value'] ?? false ) == $form['id'] ? 'selected' : null ?>
                >
					<?php echo $form['title'] ?>
                </option>
			<?php } ?>

        </select>


		<?php
	}

}

class WPBS_ACF_field_select_menu extends \acf_field {

	public $show_in_rest = true;

	public function __construct() {

		$this->name     = 'menu_select';
		$this->label    = __( 'Menu Select', 'WPBS' );
		$this->category = 'choice'; // basic | content | choice | relational | jquery | layout | CUSTOM GROUP NAME

		parent::__construct();
	}

	public function render_field_validation_settings( $field ) {
		acf_render_field_setting(
			$field,
			array(
				'label' => __( 'Allow Null', 'WPBS' ),
				'type'  => 'true_false',
				'ui'    => 1,
				'name'  => 'allow_null',
			)
		);
	}

	public function render_field( $field ) {

		?>


        <select
                class="<?= implode( ' ', array_filter( [
					$field['wrapper']['class'] ?? $field['class'] ?? null
				] ) ) ?>"
                id="<?php echo esc_attr( $field['wrapper']['id'] ?? $field['id'] ?? null ) ?>"
                name="<?php echo esc_attr( $field['name'] ) ?>"
        >
			<?php if ( ! empty( $field['allow_null'] ) ) { ?>
                <option value="" selected="selected" data-i="0">- Select -</option>
			<?php } ?>

			<?php foreach ( get_registered_nav_menus() as $id => $name ) { ?>
                <option value="<?= $id ?? null ?>"
					<?php echo ( $field['value'] ?? false ) == $id ? 'selected' : null ?>
                >
					<?php echo $name ?>
                </option>
			<?php } ?>

        </select>


		<?php
	}

}

class WPBS_ACF_field_select_taxonomies extends \acf_field {

	public $show_in_rest = true;

	public function __construct() {

		$this->name     = 'taxonomy_select';
		$this->label    = __( 'Taxonomies Select', 'WPBS' );
		$this->category = 'choice'; // basic | content | choice | relational | jquery | layout | CUSTOM GROUP NAME

		parent::__construct();
	}

	public function render_field_validation_settings( $field ) {
		acf_render_field_setting(
			$field,
			array(
				'label' => __( 'Allow Null', 'WPBS' ),
				'type'  => 'true_false',
				'ui'    => 1,
				'name'  => 'allow_null',
			)
		);
	}

	public function render_field( $field ): void {

		$field = WPBS::clean_array( $field );

		$taxonomies = array_map( function ( $tax_slug ) {
			return get_taxonomy( $tax_slug );
		}, array_keys( get_taxonomies( [
			'public'       => true,
			'show_in_rest' => true,
		] ) ) );

		?>


        <select
                class="<?= implode( ' ', array_filter( [
					$field['wrapper']['class'] ?? $field['class'] ?? null
				] ) ) ?>"
                id="<?php echo esc_attr( $field['wrapper']['id'] ?? $field['id'] ?? null ) ?>"
                name="<?php echo esc_attr( $field['name'] ) ?>"
        >
			<?php if ( ! empty( $field['allow_null'] ) ) { ?>
                <option value="" selected="selected" data-i="0">- Select -</option>
			<?php } ?>

			<?php foreach ( $taxonomies as $taxonomy ) {
				if ( ! is_a( $taxonomy, 'WP_Taxonomy' ) ) {
					continue;
				}
				?>
                <option value="<?= $taxonomy->name ?>"
					<?php echo ( $field['value'] ?? false ) == $taxonomy->name ? 'selected' : null ?>
                >
					<?php echo $taxonomy->label ?>
                </option>
			<?php } ?>

        </select>


		<?php
	}

}

class WPBS_ACF_field_select_term extends \acf_field {

	public $show_in_rest = true;

	public function __construct() {

		$this->name     = 'term_select';
		$this->label    = __( 'Term Select', 'WPBS' );
		$this->category = 'choice'; // basic | content | choice | relational | jquery | layout | CUSTOM GROUP NAME
		$this->supports = [
			'escaping_html' => true
		];

		parent::__construct();
	}

	public function format_value( $value, $post_id, $field ): array|false {

		if ( empty( $value ) || ! is_string( $value ) ) {
			return false;
		}

		return explode( '|', $value );
	}

	public function render_field_validation_settings( $field ): void {
		acf_render_field_setting(
			$field,
			array(
				'label' => __( 'Allow Null', 'WPBS' ),
				'type'  => 'true_false',
				'ui'    => 1,
				'name'  => 'allow_null',
			)
		);
	}

	public function render_field( $field ): void {

		$field = WPBS::clean_array( $field );

		$post_types = array_values( array_map( function ( $name ) {

			return get_post_type_object( $name );
		}, array_filter( array_values( get_post_types( [
			'public' => true
		] ) ), function ( $cpt ) {
			return ! in_array( $cpt, [
				'attachment'
			] );
		} ) ) );

		/*$taxonomies = array_filter( array_merge( ...array_map( function ( $cpt ) {
			return array_keys( get_taxonomies( [
				'object_type' => [ $cpt->name ],
			] ) );
		}, $post_types ) ), function () {
			return true;
		} );*/

		$taxonomies = get_taxonomies( [
			'public' => true,
		] );

		?>


        <select
                class="<?= implode( ' ', array_filter( [
					$field['wrapper']['class'] ?? $field['class'] ?? null
				] ) ) ?>"
                id="<?php echo esc_attr( $field['wrapper']['id'] ?? $field['id'] ?? null ) ?>"
                name="<?php echo esc_attr( $field['name'] ) ?>"
        >
			<?php if ( ! empty( $field['allow_null'] ) ) { ?>
                <option value="" selected="selected" data-i="0">- Select -</option>
			<?php } ?>

			<?php foreach ( $taxonomies as $tax ) {

				$tax = get_taxonomy( $tax );

				$terms = get_terms( [
					'taxonomy'   => $tax->name,
					'hide_empty' => false,
				] );

				if ( empty( $terms ) ) {
					continue;
				}


				?>
                <option value="" disabled>
					<?php echo $tax->label ?>
                </option>

				<?php
				foreach ( $terms as $term ) {

					$val = join( '|', [ $term->slug, $term->taxonomy ] );
					?>
                    <option value="<?= $val; ?>"
						<?php echo ( $field['value'] ?? false ) == $val ? 'selected' : null ?>
                    >
						<?php echo $term->name ?>
                    </option>
				<?php } ?>


			<?php } ?>

        </select>


		<?php
	}

}

class WPBS_ACF {

	private static WPBS_ACF $instance;

	private function __construct() {

		if (
			is_admin() &&
			class_exists( 'ACF' )
		) {
			add_action( 'acf/init', [ $this, 'register_fields' ], 50 );
		}

		add_action( 'acf/save_post', [ $this, 'clear_transients' ], 100 );
		add_filter( 'acf/blocks/wrap_frontend_innerblocks', '__return_false', 10 );

	}

	public function clear_transients(): void {
		WPBS::clear_transients();
	}


	public function register_fields(): void {

		acf_register_field_type( 'wpbs_acf_field_select_form' );
		acf_register_field_type( 'wpbs_acf_field_select_menu' );
		acf_register_field_type( 'wpbs_acf_field_select_taxonomies' );
		acf_register_field_type( 'wpbs_acf_field_select_cpt' );
		acf_register_field_type( 'wpbs_acf_field_select_term' );
	}

	public static function init(): WPBS_ACF {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_ACF();
		}

		return self::$instance;
	}

}

