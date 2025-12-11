<?php

$settings = $block->context['wpbs/group'] ?? [];
$faq_item = $block->context['wpbs/faqItem'] ?? [];

$question = $faq_item['question'] ?? '';

if ( empty( $question ) ) {
    return;
}

$block_props = get_block_wrapper_attributes( [
        'class' => 'wpbs-faq-header w-full flex items-center justify-between'
] );

$icon = $settings['icon'];

?>

<div <?= $block_props ?>>
    <span class="wpbs-faq-header__text"><?= $question ?></span>
    <button class="wpbs-faq-header__button">
        <?php
        echo '<span class="material-symbols-outlined" style="' . $icon['styles'] . '">' . esc_html( $icon['name'] ?? 'add' ) . '</span>';
        ?>

    </button>

</div>
