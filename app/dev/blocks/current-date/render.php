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

<span <?php echo $wrapper_attributes ?>>
	<?php

	if ( ! empty( $settings['prefix'] ) ) {
		echo '<span class="wpbs-current-date__prefix">' . esc_html($prefix) . '</span>';
		echo '<span class="wpbs-current-date__date">' . esc_html(date( $format )) . '</span>';
	} else {
		echo date( $format );
	}

	?>
</span>
