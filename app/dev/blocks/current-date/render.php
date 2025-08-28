<?php

$settings = $attributes['wpbs-current-date'] ?? [];

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-current-date w-fit inline-block whitespace-nowrap',
		$attributes['uniqueId'] ?? null
	] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );

$format = $settings['format-custom'] ?? $settings['format'] ?? 'm/d/Y';

?>

<div <?php echo $wrapper_attributes ?>>
	<?php

	if ( ! empty( $settings['prefix'] ) ) {
		echo '<span class="wpbs-current-date__prefix">' . $settings['prefix'] . '</span>';
		echo '<span class="wpbs-current-date__date">' . date( $format ) . '</span>';
	} else {
		echo date( $format );
	}

	?>
</div>
