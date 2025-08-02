<?php


$location        = $attributes['location'] ?? 'primary';
$container_class = $attributes['containerClass'] ?? 'wpbs-menu-container';
$menu_class      = $attributes['menuClass'] ?? 'wpbs-menu';

$locations = get_nav_menu_locations();
$menu_id   = $locations[ $location ] ?? null;

if ( ! $menu_id ) {
	echo '<div class="' . esc_attr( $container_class ) . '">Menu not found.</div>';

	return;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-translate',
		$attributes['uniqueId'] ?? ''
	] ) )
] );

?>


<nav <?php echo $wrapper_attributes ?>>

	<?php echo wp_nav_menu( [
		'menu'            => $menu_id,
		'menu_class'      => esc_attr( $menu_class ),
		'container_class' => esc_attr( $container_class ),
		'echo'            => false,
	] ); ?>

</nav>