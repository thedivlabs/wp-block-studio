<?php

$settings = $_GET['settings'] ?? $attributes['wpbs-nav-menu'] ?? false;

$menu_id = $settings['menu'] ?? false;

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-nav-menu wpbs-has-container flex flex-wrap',
		$attributes['uniqueId'] ?? ''
	] ) ),
    'data-wp-interactive' => 'wpbs/nav-menu'
] );

$menu_class = implode( ' ', array_filter( [
        'wpbs-nav-menu-container wpbs-container wpbs-layout-wrapper',
]));

if ( empty( $menu_id ) ) {
	echo '<div ' . $wrapper_attributes . '>Menu not found.</div>';

	return;
}

?>


<nav <?php echo $wrapper_attributes ?>>

	<?php echo wp_nav_menu( [
		'menu'            => intval( $menu_id ),
		'menu_class'      => $menu_class,
		'container'      => false,
		'echo'            => false,
	] ); ?>

</nav>