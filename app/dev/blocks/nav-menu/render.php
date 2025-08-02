<?php

$menu_id = $attributes['menu'] ?? false;

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-nav-menu',
		$attributes['uniqueId'] ?? ''
	] ) )
] );

print_r( $menu_id ?? false );
print_r( $attributes ?? false );

if ( empty( $menu_id ) ) {
	echo '<div ' . $wrapper_attributes . '>Menu not found.</div>';

	return;
}

?>


<nav <?php echo $wrapper_attributes ?>>

	<?php echo wp_nav_menu( [
		'menu'            => intval( $menu_id ),
		'menu_class'      => 'wpbs-menu',
		'container_class' => 'wpbs-menu-container',
		'echo'            => false,
	] ); ?>

</nav>