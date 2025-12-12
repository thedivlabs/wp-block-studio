<?php
$settings = $attributes['wpbs-nav-menu'] ?? [];
$menu_id  = $settings['menu'] ?? false;

if ( empty( $menu_id ) ) {
    return;
}

$classes = [
        'wpbs-nav-menu',
        'wpbs-has-container',
        'flex',
        'flex-wrap',
        $attributes['uniqueId'] ?? null,
        ! empty( $settings['divider'] ) ? '--divider' : null,
        ! empty( $settings['submenu-divider'] ) ? '--submenu-divider' : null,
        ! empty( $settings['style'] ) ? 'is-style-' . sanitize_html_class( $settings['style'] ) : null,
];

$wrapper_attributes = get_block_wrapper_attributes( [
        'class'               => implode( ' ', array_filter( $classes ) ),
        'data-wp-interactive' => 'wpbs/nav-menu',
        'data-wp-init'        => 'actions.init',
] );

$menu_class = 'wpbs-nav-menu-container wpbs-container wpbs-layout-wrapper';

$has_submenu = in_array(
        'is-style-' . ( $settings['style'] ?? '' ),
        [ 'is-style-dropdown', 'is-style-accordion' ],
        true
);
?>

<nav <?php echo $wrapper_attributes; ?>>
    <?php
    echo wp_nav_menu( [
            'menu'       => (int) $menu_id,
            'menu_class' => $menu_class,
            'container'  => false,
            'echo'       => false,
            'depth'      => $has_submenu ? 2 : 1,
    ] );
    ?>
</nav>
