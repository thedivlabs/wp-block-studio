<?php

$settings = $attributes['wpbs-faq-group'] ?? false;

if ( empty( $settings ) ) {
	return;
}

$term_id  = is_tax() ? get_queried_object()?->term_id : false;
$term     = $term_id ? get_term( $term_id ) : false;
$term_ref = $term_id ? "{$term->taxonomy}_{$term->term_id}" : false;

$faq_id = match ( true ) {
	( $settings['faq-id'] ?? false ) == 'current' && is_tax() => intval( get_field( 'wpbs_faq_group', $term_ref ) ?: get_field( 'wpbs_faq', $term_ref ) ?: false ),
	( $settings['faq-id'] ?? false ) == 'current' => intval( get_field( 'wpbs_faq_group', get_the_ID() ) ?: get_field( 'wpbs_faq', get_the_ID() ) ?: false ),
	default => intval( $settings['faq-id'] ?? false )
};

$faqs = WPBS::clean_array( get_field( 'wpbs_questions', $faq_id ) );

if ( ! $faqs ) {
	return;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-faq-group',
		$attributes['uniqueId'] ?? ''
	] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );

?>

<ul <?= $wrapper_attributes ?>>
	<?php foreach ( $faqs as $faq ) {

		if ( empty( $faq['question'] ) || empty( $faq['answer'] ) ) {
			continue;
		}
		?>
        <li>
            <div class="wpbs-faq-group__header">
				<?= $faq['question'] ?>
            </div>
            <div class="wpbs-faq-group__content">
				<?= $faq['question'] ?>
            </div>
        </li>
	<?php } ?>
</ul>


