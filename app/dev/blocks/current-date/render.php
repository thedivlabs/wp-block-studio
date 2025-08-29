<?php

$settings = WPBS::clean_array($attributes['wpbs-current-date'] ?? []);

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => implode( ' ', array_filter( [
		'wpbs-current-date w-fit inline-block whitespace-nowrap',
		$attributes['uniqueId'] ?? null
	] ) ),
	...( $attributes['wpbs-props'] ?? [] )
] );

$format = $settings['format-custom'] ?? $settings['format'] ?? $block->context['format'] ?? 'm/d/Y';

$format = match($format){
    'year' => 'Y',
    default => $format
};

$prefix = $settings['prefix'] ?? $block->context['prefix'] ?? false;

?>

<div <?php echo $wrapper_attributes ?>>
	<?php

	if ( ! empty( $settings['prefix'] ) ) {
		echo '<span class="wpbs-current-date__prefix">' . $prefix . '</span>';
		echo '<span class="wpbs-current-date__date">' . date( $format ) . '</span>';
	} else {
		echo date( $format );
	}

	?>
</div>
