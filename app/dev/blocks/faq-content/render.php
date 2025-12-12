<?php

$settings = $block->context['wpbs/group'] ?? [];
$faq_item = $block->context['wpbs/faqItem'] ?? [];

if ( empty( $faq_item ) ) {
    echo $content ?? '';

    return;
}

$answer = $faq_item['answer'] ?? '';

if ( empty( $answer ) ) {
    return;
}

$block_props = get_block_wrapper_attributes( [
        'class' => join( ' ', array_filter( [
                'wpbs-faq-content',
        ] ) )
] );

?>

<div <?= $block_props ?>>
    <?= wp_kses_post( $answer ); ?>
</div>
