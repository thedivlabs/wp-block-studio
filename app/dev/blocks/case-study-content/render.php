<?php

$settings = $attributes['wpbs-case-study-content'] ?? false;

if ( empty( $settings ) ) {
	return;
}

$type          = $settings['type'] ?? false;
$case_study_id = ( $settings['case-study-id'] ?? false ) == 'current' ? get_the_ID() : intval( $settings['case-study-id'] ?? false );

if ( ! $type || ! $case_study_id ) {
	return;
}

$dynamic_content = match ( $type ) {
	'overview-title' => get_field( 'wpbs_content_overview_title', $case_study_id ),
	'overview-text' => get_field( 'wpbs_content_overview_text', $case_study_id ),
	'description-title' => get_field( 'wpbs_content_description_title', $case_study_id ),
	'description-text' => get_field( 'wpbs_content_description_text', $case_study_id ),
	'general-title' => get_field( 'wpbs_content_general_title', $case_study_id ),
	'general-text' => get_field( 'wpbs_content_general_text', $case_study_id ),
	'poster' => get_field( 'wpbs_media_featured_poster', $case_study_id ),
	'thumbnail' => get_field( 'wpbs_media_featured_thumbnail', $case_study_id ),
	'icon' => get_field( 'wpbs_media_featured_icon', $case_study_id ),
	'faq-title' => get_field( 'wpbs_faq_content_title', $case_study_id ),
	'faq-text' => get_field( 'wpbs_faq_content_text', $case_study_id ),
	'related-title' => get_field( 'wpbs_related_content_title', $case_study_id ),
	'related-text' => get_field( 'wpbs_related_content_text', $case_study_id ),
	'cta-title' => get_field( 'wpbs_cta_content_title', $case_study_id ),
	'cta-text' => get_field( 'wpbs_cta_content_text', $case_study_id ),
	'cta-image' => WPBS::clean_array( get_field( 'wpbs_cta_media', $case_study_id ) ),
	default => null
};

if ( empty( $dynamic_content ) ) {
	return false;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-case-study-content inline-block',
		! empty( $settings['line-clamp'] ) ? '--line-clamp' : null,
		$attributes['uniqueId'] ?? ''
	] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );

$is_link = ! empty( $settings['link-post'] );

$link_target = ! empty( $settings['link-post']['linkNewTab'] ) ? '_blank' : '_self';
$link_rel    = $settings['link-post']['linkRel'] ?? '';
$link_title  = $settings['link-post']['linkTitle'] ?? '';

$loading = ! empty( $settings['eager'] ) ? 'eager' : 'lazy';

$element_tag = $attributes['wpbs-element-tag'] ?? 'div';

?>

<?php


if ( $is_link ) {
	echo '<a href="' . get_the_permalink( $case_study_id ) . '" target="' . $link_target . '" ' . $wrapper_attributes . ' title="' . $link_title . '">';
} else {
	echo '<' . $element_tag . ' ' . $wrapper_attributes . '>';
}

switch ( $type ) {
	case 'poster':
	case 'thumbnail':
		echo wp_get_attachment_image( $dynamic_content, ( $settings['resolution'] ?? 'large' ), false, [
			'loading' => $loading,
			'class'   => 'w-full h-full object-cover'
		] );
		break;
	case 'cta-image':

		echo WPBS::picture(
			$dynamic_content['image_mobile'] ?? false,
			$dynamic_content['image_large'] ?? false,
			$attributes['wpbs-breakpoint']['large'] ?? false,
			$settings['resolution'] ?? false, $loading );
		break;
	default:
		echo $dynamic_content;
}


if ( $is_link ) {
	echo '</a>';
} else {
	echo '</' . $element_tag . '>';
}

?>


