<?php
/**
 * Loop Card Block — Clean, Slide-Consistent Renderer
 */

if ( empty( $block->context ) ) {
    echo wp_kses_post( $content ?? '' );

    return;
}

$settings   = $block->context['wpbs/query'] ?? [];
$media_item = $block->context['wpbs/media'] ?? null;

$wrapper_attrs = get_block_wrapper_attributes( [
        'class'      => implode( ' ', array_filter( [
                'wpbs-loop-card',
                'grid-card',
                'w-full',
                'block',
                'relative',
                $attributes['uniqueId'] ?? '',
        ] ) ),
        'data-index' => $block->context['wpbs/index'] ?? null
] );

echo '<div ' . $wrapper_attrs . '>';

// -----------------------------------------
// Media renderer (matches Slide logic)
// -----------------------------------------

$media = new WPBS_Media( $media_item, $settings );
echo $media->render();


// -----------------------------------------
// Render InnerBlocks
// -----------------------------------------

foreach ( $block->parsed_block['innerBlocks'] as $inner_block ) {
    echo render_block( $inner_block );
}


// -----------------------------------------
// Replace placeholders in closing wrapper
// -----------------------------------------

$inner_content = $block->parsed_block['innerContent'] ?? [];

if ( ! empty( $inner_content ) ) {

    $last_key = array_key_last( $inner_content );
    $closing  = $inner_content[ $last_key ] ?? '';

    // Term replacement
    if ( ! empty( $block->context['wpbs/termId'] ) ) {
        $term_link = get_term_link( (int) $block->context['wpbs/termId'] );
        if ( ! is_wp_error( $term_link ) ) {
            $closing = str_replace( '%%__TERM_LINK_URL__%%', esc_url( $term_link ), $closing );
        }
    }

    // Post replacement
    if ( ! empty( $block->context['wpbs/postId'] ) ) {
        $permalink = get_permalink( (int) $block->context['wpbs/postId'] );
        $closing   = str_replace( '%%__POST_LINK_URL__%%', esc_url( $permalink ), $closing );
    }

    echo $closing;
}
