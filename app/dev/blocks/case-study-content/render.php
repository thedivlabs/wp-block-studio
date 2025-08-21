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

	'name' => get_field( 'wpbs_details_name', $case_study_id ),
	'date' => get_field( 'wpbs_details_date', $case_study_id ),
	'location' => get_field( 'wpbs_details_location', $case_study_id ),

	'overview-title' => get_field( 'wpbs_content_overview_title', $case_study_id ),
	'overview-text' => get_field( 'wpbs_content_overview_text', $case_study_id ),

	'objective-title' => get_field( 'wpbs_content_objective_title', $case_study_id ),
	'objective-text' => get_field( 'wpbs_content_objective_text', $case_study_id ),

	'solution-title' => get_field( 'wpbs_content_solution_title', $case_study_id ),
	'solution-text' => get_field( 'wpbs_content_solution_text', $case_study_id ),

	'results-title' => get_field( 'wpbs_content_results_title', $case_study_id ),
	'results-text' => get_field( 'wpbs_content_results_text', $case_study_id ),

	'poster' => get_field( 'wpbs_media_featured_poster', $case_study_id ),
	'thumbnail' => get_field( 'wpbs_media_featured_thumbnail', $case_study_id ),


	'client-name' => get_field( 'wpbs_client_details_name', $case_study_id ),
	'client-company' => get_field( 'wpbs_client_details_company', $case_study_id ),
	'client-location' => get_field( 'wpbs_client_details_location', $case_study_id ),
	'client-description' => get_field( 'wpbs_client_description', $case_study_id ),

	'cta-title' => get_field( 'wpbs_cta_title', $case_study_id ),
	'cta-text' => get_field( 'wpbs_cta_text', $case_study_id ),
	'cta-image' => WPBS::clean_array( get_field( 'wpbs_cta_image', $case_study_id ) ),

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

$is_link     = ! empty( $settings['link-post'] );
$link_url    = ! empty( $settings['link-client'] ) ? get_field( 'wpbs_client_details_link', $case_study_id ) : get_the_permalink( $case_study_id );
$link_target = ! empty( $settings['link-post']['linkNewTab'] ) ? '_blank' : '_self';
$link_rel    = $settings['link-post']['linkRel'] ?? '';
$link_title  = $settings['link-post']['linkTitle'] ?? '';

$loading = ! empty( $settings['eager'] ) ? 'eager' : 'lazy';

$element_tag = $attributes['wpbs-element-tag'] ?? 'div';

?>

<?php

echo '<' . $element_tag . ' ' . $wrapper_attributes . '>';
if ( $is_link ) {
	echo '<a href="' . get_the_permalink( $case_study_id ) . '" target="' . $link_target . '" title="' . $link_title . '">';
}

switch ( $type ) {
	case 'poster':
	case 'thumbnail':
	case 'cta-image':
		echo wp_get_attachment_image( $dynamic_content, ( $settings['resolution'] ?? 'large' ), false, [
			'loading' => $loading,
			'class'   => 'w-full h-full object-cover'
		] );
		break;
	default:
		echo $dynamic_content;
}


if ( $is_link ) {
	echo '</a>';
}

echo '</' . $element_tag . '>';

?>


