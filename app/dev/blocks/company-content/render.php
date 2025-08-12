<?php


WPBS::console_log( $attributes );

$settings = $attributes['wpbs-company-content'];


if ( ! empty( $settings['line-clamp'] ) ) {
	$style_attribute = implode( '; ', [
		'line-clamp:' . $settings['line-clamp'],
		'-webkit-line-clamp:' . $settings['line-clamp'],
		'display:-webkit-box',
		'-webkit-box-orient:vertical',
		'overflow:hidden',
	] );
}


$type       = $settings['type'] ?? false;
$company_id = intval( $settings['company-id'] ?? false );

if ( ! $type || ! $company_id ) {
	return;
}

$company = new WPBS_Place( $company_id );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-company-content inline-block',
		! empty( $settings['icon'] ) ? '--icon' : null,
		! empty( $settings['label-position'] ) ? '--label-' . $settings['label-position'] : null,
		$attributes['uniqueId'] ?? ''
	] ) ),
	'style' => trim( join( ' ', [ $style_attribute ?? '', ] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );

WPBS::console_log( $company );

$is_link = in_array( $type, [ 'reviews-link', 'map-link', 'directions-link' ], true );


?>


<?php if ( $is_link ){ ?><a href="" target="_blank" <?php echo $wrapper_attributes ?>> <?php } else { ?>
    <div <?php echo $wrapper_attributes ?>><?php } ?>

        <div <?php echo $wrapper_attributes ?>>


			<?php

			switch ( $type ) {
				case 'title':
					echo get_the_title( $company_id );
					break;
				case 'phone':
					echo $company->get_phone();
					break;
				case 'email':
					echo $company->get_email();
					break;
				case 'address':
					echo $company->get_address();
					break;
				case 'description':
					echo $company->summary();
					break;
				case 'reviews-link':
					if ( ! empty( $company->reviews_page ) && ! empty( $settings['label'] ) ) {
						echo '<a href="' . $company->reviews_page . '" target="_blank" class="wpbs-company-content-container">' . $settings['label'] . '</a>';
					}
					break;
				default:
					echo '';
			}


			?>
        </div>


