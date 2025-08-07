<?php

if ( ! function_exists( 'gravity_form' ) ) {
	return;
}

$settings = $attributes['wpbs-contact-form'] ?? false;

$form_id = $settings['form'] ?? false;

if ( empty( $form_id ) ) {
	return false;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'               => implode( ' ', array_filter( [
		'wpbs-contact-form',
		! empty( $settings['center'] ) ? '--center' : null,
		! empty( $settings['collapse'] ) ? '--collapse' : null,
		$attributes['uniqueId'] ?? '',
	] ) ),
	'data-wp-interactive' => 'wpbs/contact-form',
	'data-wp-init'        => 'actions.init'
] );

?>


<div <?php echo $wrapper_attributes ?>>

	<?php gravity_form( $form_id, false, false, false, false, true, null ); ?>

</div>