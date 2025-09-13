<?php

$settings = $attributes['wpbs-team-member-content'] ?? false;

if ( empty( $settings ) ) {
	return;
}

$type    = $settings['type'] ?? false;
$team_id = intval( $block->context['wpbs/postId'] ?? $_GET['postId'] ?? get_the_ID() );;
$is_image = ! empty( $settings['icon'] ) || in_array( $type, [
		'headshot',
		'featured-image',
		'signature',
	], true );

if ( ! $type || ! $team_id ) {
	return;
}

$dynamic_content = match ( $type ) {
	'first-name' => get_field( 'wpbs_details_general_first_name', $team_id ),
	'last-name' => get_field( 'wpbs_details_general_last_name', $team_id ),
	'full-name' => join( ' ', WPBS::clean_array( [
		get_field( 'wpbs_details_general_first_name', $team_id ),
		get_field( 'wpbs_details_general_middle_name', $team_id ),
		get_field( 'wpbs_details_general_last_name', $team_id ),
	] ) ),
	'job-title' => join( ' ', array_column( ( get_field( 'wpbs_details_general_job_title', $team_id ) ?: [] ), 'title' ) ),
	'location' => get_field( 'wpbs_details_general_location', $team_id ),
	'profile' => get_field( 'wpbs_content_profile', $team_id ),
	'summary' => get_field( 'wpbs_content_summary', $team_id ),
	'email' => get_field( 'wpbs_contact_email', $team_id ),
	'phone' => get_field( 'wpbs_contact_phone_number', $team_id ),
	'extension' => get_field( 'wpbs_contact_ext', $team_id ),
	'headshot' => get_field( 'wpbs_media_featured_headshot', $team_id ),
	'social' => get_field( 'wpbs', $team_id )['social'] ?? false,
	'featured-image' => get_post_thumbnail_id( $team_id ),
	'signature' => get_field( 'wpbs_media_misc_signature', $team_id ),
	'cv' => get_field( 'wpbs_media_misc_cv', $team_id ),
	default => null
};

if ( empty( $dynamic_content ) ) {
	return false;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'   => implode( ' ', array_filter( [
		'wpbs-team-member-content w-fit',
		$is_image ? 'inline-flex overflow-hidden' : null,
		! empty( $settings['icon'] ) ? 'inline-flex --icon material-icon-before items-center' : 'inline-block',
		! empty( $settings['line-clamp'] ) ? '--line-clamp' : null,
		! empty( $settings['toggle'] ) ? 'team-profile-toggle' : null,
		$attributes['uniqueId'] ?? ''
	] ) ),
	'data-id' => $team_id,
	...( $attributes['wpbs-props'] ?? [] )
] );

$is_cv       = $type == 'cv';
$is_link     = ! empty( $settings['link-post'] ) || $is_cv || in_array( $type, [ 'email', 'phone' ] );
$link_url    = $is_link ? match ( $type ) {
	'cv' => wp_get_attachment_url( $dynamic_content ),
	'phone' => 'tel:' . $dynamic_content,
	'email' => 'mailto:' . $dynamic_content,
	default => get_the_permalink( $team_id )
} : false;
$link_target = ! empty( $settings['link-post']['linkNewTab'] ) || $is_cv ? '_blank' : '_self';
$link_rel    = $settings['link-post']['linkRel'] ?? '';
$link_title  = $settings['link-post']['linkTitle'] ?? '';

$loading = ! empty( $settings['eager'] ) ? 'eager' : 'lazy';

if ( $is_cv ) {
	$dynamic_content = $settings['label'] ?? 'CV';
}

$element_tag = $attributes['wpbs-element-tag'] ?? 'div';

?>

<?php

echo '<' . $element_tag . ' ' . $wrapper_attributes . '>';

if ( $is_link ) {
	echo '<a href="' . $link_url . '" target="' . $link_target . '" title="' . $link_title . '">';
}

switch ( $type ) {
	case 'headshot':
	case 'featured-image':
	case 'signature':
		echo wp_get_attachment_image( $dynamic_content, ( $settings['resolution'] ?? 'large' ), false, [
			'loading' => $loading,
			'class'   => 'w-full h-full object-cover'
		] );
		break;
	case 'social':


		( new WPBS_Social( $dynamic_content ) )->render();

		break;
	default:

		if ( ! empty( $settings['icon'] ) ) {
			echo '<span>' . $dynamic_content . '</span>';
		} else {
			echo $dynamic_content;
		}

}


if ( $is_link ) {
	echo '</a>';
}

echo '</' . $element_tag . '>';

?>



