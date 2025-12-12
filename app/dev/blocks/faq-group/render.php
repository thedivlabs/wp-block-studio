<?php
declare( strict_types=1 );

// Safety
$content = $content ?? '';


/**
 * 1. Load settings
 */
$settings = $attributes['wpbs-faq-group'] ?? [];
$group_id = $settings['group'] ?? null;

if ( empty( $group_id ) ) {
    echo $content;

    return;
}


/**
 * 2. Extract the template block (first innerBlock of this group block)
 */
$template = $block->parsed_block['innerBlocks'][0] ?? null;

if ( ! $template ) {
    echo $content;

    return;
}

/**
 * 3. Load ACF FAQ rows
 */
$faqs = get_field( 'wpbs_questions', $group_id );

if ( empty( $faqs ) || ! is_array( $faqs ) ) {
    return;
}

$faq_content = '';

/**
 * 4. Loop cloned template for each FAQ row
 */
foreach ( $faqs as $faq ) {

    // Duplicate full parsed block structure
    //$item = wpbs_clone_block( $template );
    $item = json_decode( json_encode( $template ), true );

    // Add our dynamic attributes
    $item['attrs']['faqItem'] = $faq;
    $item['attrs']['group']   = $settings;

    // -------------------------------------------
    // Inject FAQ question & answer
    // Template structure:
    //   item
    //     ├── faq-header
    //     │       └── paragraph
    //     └── faq-content
    //             └── paragraph
    // -------------------------------------------

    // Header paragraph
    if ( isset( $item['innerBlocks'][0]['innerBlocks'][0] ) ) {
        $header = &$item['innerBlocks'][0]['innerBlocks'][0];
        $text   = $faq['question'];

        $header['innerHTML']    = $text;
        $header['innerContent'] = [ $header['innerHTML'] ];
    }

    // Content paragraph
    if ( isset( $item['innerBlocks'][1]['innerBlocks'][0] ) ) {
        $content_block = &$item['innerBlocks'][1]['innerBlocks'][0];
        $text          = $faq['answer'];

        $content_block['innerHTML']    = $text;
        $content_block['innerContent'] = [ $content_block['innerHTML'] ];
    }

    // Render block instance so global styles + block supports apply
    $item_block  = new WP_Block( $item, $block->context );
    $faq_content .= $item_block->render();
}

$wrapper_props = get_block_wrapper_attributes( [
        'class'               => join( ' ', array_filter( [
                'wpbs-faq-group w-full flex flex-col',
                $attributes['uniqueId'] ?? null,
                ! empty( $settings['divider'] ) ? '--divider' : null,
                ! empty( $settings['single'] ) ? '--single' : null,
        ] ) ),
        'data-wp-interactive' => 'wpbs/faq-group',
        'data-wp-init'        => 'actions.init'
] );


?>

<div <?= $wrapper_props ?>>
    <?= $faq_content ?>
</div>
