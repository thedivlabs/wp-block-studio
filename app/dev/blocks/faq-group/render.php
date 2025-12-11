<?php
declare( strict_types=1 );

// Safety
$content = $content ?? '';

/**
 * 1. Read block mode from context
 */
$settings = $attributes['wpbs-faq-group'] ?? [];
$group_id = $settings['group'] ?? null;

$faqs = get_field( 'wpbs_questions', $group_id );

if ( empty( $faqs ) ) {
	return;
}

$faq_content = '';

foreach ( $faqs as $faq ) {

	$item_block = new WP_Block( [
		'blockName' => 'wpbs/faq-item',
		'attrs'     => [
			'faqItem' => $faq,
			'group'   => $settings,
		],
	], [
		'wpbs/faqItem' => $faq,
		'wpbs/group'   => $settings,
	] );

	$item_block->context['wpbs/faqItem'] = $faq;
	$item_block->context['wpbs/group']   = $settings;

	$faq_content .= $item_block->render();


}

echo str_replace( '%%__FAQ_CONTENT__%%', $faq_content, $content );;



