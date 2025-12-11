<?php

$settings = $block->context['wpbs/group'] ?? [];
$faq_item = $block->context['wpbs/faqItem'] ?? [];

$answer = $faq_item['answer'] ?? '';

if ( empty( $answer ) ) {
    return;
}

$block_props = get_block_wrapper_attributes( [
        'class' => join( ' ', array_filter( [
                'wpbs-faq-content',
                $settings['styleClass'] ?? null
        ] ) )
] );

?>

<div <?= $block_props ?>>
    <?= $answer ?>
</div>
