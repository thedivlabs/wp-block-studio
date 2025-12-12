<?php
$settings = $block->context['wpbs/group'] ?? [];
$faq_item = $block->context['wpbs/faqItem'] ?? [];

if ( empty( $faq_item ) ) {
    echo $content ?? '';

    return;
}

if ( empty( $faq_item['question'] ) || empty( $faq_item['answer'] ) ) {
    return;
}

$block_props = get_block_wrapper_attributes( [
        'class' => join( ' ', array_filter( [
                'wpbs-faq-item w-full flex flex-col overflow-hidden relative',
        ] ) )
] );


$faq_header  = new WP_Block( [
        'blockName' => 'wpbs/faq-header'
], $block->context ?? [] );
$faq_content = new WP_Block( [
        'blockName' => 'wpbs/faq-content'
], $block->context ?? [] );


?>

<div <?= $block_props ?>>
    <?= $faq_header->render() ?>
    <?= $faq_content->render() ?>
</div>


