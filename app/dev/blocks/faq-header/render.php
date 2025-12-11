<?php

$settings = $block->context['wpbs/group'] ?? [];
$faq_item = $block->context['wpbs/faqItem'] ?? [];
WPBS::console_log( $settings );
$question = $faq_item['question'] ?? '';

if ( empty( $question ) ) {
    return;
}

$block_props = get_block_wrapper_attributes( [
        'class' => 'wpbs-faq-header'
] );

$icon = $settings['icon'];


?>

<div <?= $block_props ?>>
    <span class="wpbs-faq-header__text"><?= $question ?></span>
    <button class="wpbs-faq-header__button">
        <?php
        echo '<span class="material-symbols-outlined" style="' .
             implode( ';', array_map(
                     fn( $k, $v ) => "$k:$v",
                     array_keys( $styles = array_filter( [
                             'font-size'               => ! empty( $icon['size'] ) ? $icon['size'] . 'px' : null,
                             'color'                   => $icon['color'] ?? null,
                             'font-variation-settings' => $icon['css'] ?? null,
                     ] ) ),
                     $styles
             ) ) .
             '">' . esc_html( $icon['name'] ?? 'add' ) . '</span>';
        ?>

    </button>

</div>
