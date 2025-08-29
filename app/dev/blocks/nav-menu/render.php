<?php

$settings = $_GET['settings'] ?? $attributes['wpbs-nav-menu'] ?? false;

$menu_id = $settings['menu'] ?? false;

if ( empty( $menu_id ) ) {
	return false;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'               => implode( ' ', array_filter( [
		'wpbs-nav-menu wpbs-has-container',
		$attributes['uniqueId'] ?? '',
		! empty( $settings['divider'] ) || ! empty( $settings['divider-icon'] ) ? '--divider' : null,
		! empty( $settings['divider-icon'] ) ? '--divider-icon' : null,
		! empty( $settings['fade'] ) ? '--fade' : null,
	] ) ),
	'data-wp-interactive' => 'wpbs/nav-menu',
	'data-wp-init'        => 'actions.init',
	...( $attributes['wpbs-props'] ?? [] )
] );

$menu_class = implode( ' ', array_filter( [
	'wpbs-nav-menu-container wpbs-container wpbs-layout-wrapper',
] ) );

if ( empty( $menu_id ) ) {
	echo '<div ' . $wrapper_attributes . '>Menu not found.</div>';

	return;
}

$has_submenu = in_array( explode( ' ', $attributes['className'] ?? '' ), [
	'is-style-accordion',
	'is-style-dropdown'
] )

?>


<nav <?php echo $wrapper_attributes ?>>

	<?php echo wp_nav_menu( [
		'menu'       => intval( $menu_id ),
		'menu_class' => $menu_class,
		'container'  => false,
		'echo'       => false,
		'depth'      => $has_submenu ? 2 : 2,
	] ); ?>

</nav>