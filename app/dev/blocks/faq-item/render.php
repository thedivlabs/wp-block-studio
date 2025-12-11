<?php
$settings = $block->context['wpbs/group'] ?? [];
$faq_item = $block->context['wpbs/faqItem'] ?? [];

if ( empty( $faq_item['question'] ) || empty( $faq_item['answer'] ) ) {
    return;
}

$block_props = get_block_wrapper_attributes( [
        'class' => 'wpbs-faq-item w-full flex flex-col'
] );


$faq_header  = new WP_Block( [
        'blockName' => 'wpbs/faq-header'
], [
        'wpbs/faqItem' => $faq_item,
        'wpbs/group'   => $settings
] );
$faq_content = new WP_Block( [
        'blockName' => 'wpbs/faq-content'
], [
        'wpbs/faqItem' => $faq_item,
        'wpbs/group'   => $settings
] );


?>

<div <?= $block_props ?>>
    <?= $faq_header->render() ?>
    <?= $faq_content->render() ?>
</div>


