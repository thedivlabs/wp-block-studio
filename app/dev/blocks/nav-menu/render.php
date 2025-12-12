<?php

$raw      = $attributes['wpbs-nav-menu'] ?? [];
$settings = $raw['props'] ?? $raw;
$menu_id  = $settings['menu'] ?? false;

preg_match( '/\bis-style-(\S+)/', ( $block->attributes['className'] ?? '' ), $m );
$style = $m[1] ?? null;


if ( empty( $menu_id ) ) {
    return;
}

$classes = array_filter( [
        'wpbs-nav-menu',
        'wpbs-has-container',
        'flex',
        'flex-wrap',

    // style modes
        $style ? 'is-style-' . sanitize_html_class( $style ) : null,

    // feature flags
        ! empty( $settings['divider'] ) ? '--divider' : null,
        ! empty( $settings['submenu-divider'] ) ? '--submenu-divider' : null,
        ! empty( $settings['icon'] ) ? '--has-icon' : null,
        ! empty( $settings['submenu-icon'] ) ? '--has-submenu-icon' : null,
        ! empty( $settings['columns'] ) && (int) $settings['columns'] > 1 ? '--has-columns' : null,

    // icon below
        ! empty( $settings['icon-below'] ) ? '--icon-below' : null,

    // unique id
        $attributes['uniqueId'] ?? null,
] );

$wrapper_attributes = get_block_wrapper_attributes( [
        'class'               => implode( ' ', array_filter( $classes ) ),
        'data-wp-interactive' => 'wpbs/nav-menu',
        'data-wp-init'        => 'actions.init',
] );

$menu_class = 'wpbs-nav-menu-container wpbs-container wpbs-layout-wrapper';

$has_submenu = ! in_array( $style, [ 'is-style-columns' ] );
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
