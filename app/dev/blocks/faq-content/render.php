<?php

$faq_item = $block->context['wpbs/faqItem'] ?? [];

$answer = $faq_item['answer'] ?? '';

if ( empty( $answer ) ) {
    return;
}

$block_props = get_block_wrapper_attributes( [
        'class' => 'wpbs-faq-content'
] );

?>

<div <?= $block_props ?>>
    <?= $answer ?>
</div>
