<?php

if ( empty( $fields['content']['menu'] ) ) {
	return false;
}

$class = implode( ' ', array_filter( [
	'divlabs-menu',
	match ( $block->type ?? false ) {
		'list' => 'divlabs-menu--list',
		'inline' => 'divlabs-menu--inline',
		'dropdown' => implode( ' ', array_filter( [
			'divlabs-menu--dropdown',
			empty( $block->attributes['dropdown-hidden'] ) && ! empty( $block->attributes['dropdown-below'] ) ? 'divlabs-menu--dropdown-below' : null,
			! empty( $block->attributes['dropdown-hidden'] ) ? 'divlabs-menu--dropdown-hidden' : null,
		] ) ),
		'accordion' => 'divlabs-menu--accordion',
		default => 'divlabs-menu--default'
	},
	! empty( $block->attributes['sub-menu-divider'] ) ? '--sub-menu-divider' : null,
] ) );

$bp = $block->attributes['breakpoint'] ?? 'xl';

?>

<nav <?= DIVLABS::block_attributes( [
	'class'     => $class,
	'style'     => array_filter( [
		//'--accent-color'        => $fields['options']['accent_color'] ?? null,
		'--current-item'        => $block->attributes['current-item'] ?? null,
		'--link-bg'             => $block->attributes['link-bg'] ?? null,
		'--link-active'         => $block->attributes['link-active'] ?? null,
		'--link-active-bg'      => $block->attributes['link-active-bg'] ?? null,
		'--link-bg-hover'       => $block->attributes['link-bg-hover'] ?? null,
		'--link-padding-y'      => $block->attributes['link-padding-y'] ?? null,
		'--link-padding-x'      => $block->attributes['link-padding-x'] ?? null,
		'--sub-menu'            => $block->attributes['sub-menu'] ?? null,
		'--sub-menu-text'       => $block->attributes['sub-menu-text'] ?? null,
		'--sub-menu-text-hover' => $block->attributes['sub-menu-text-hover'] ?? null,
		'--sub-menu-hover'      => $block->attributes['sub-menu-hover'] ?? null,
		'--sub-menu-divider'    => $block->attributes['sub-menu-divider'] ?? null,
		'--sub-menu-padding-y'  => $block->attributes['sub-menu-padding-y'] ?? null,
		'--sub-menu-padding-x'  => $block->attributes['sub-menu-padding-x'] ?? null,
		'--sub-menu-rounded'    => $block->attributes['sub-menu-rounded'] ?? null,
		'--sub-menu-spacing'    => $block->attributes['sub-menu-spacing'] ?? null,
		'--columns-mobile'      => $fields['options']['columns_mobile'] ?? null,
		'--columns-large'       => $fields['options']['columns_large'] ?? null,
	] ),
	'data-type' => $block->type ?? null
], $block ?? false ) ?>>

	<?php

	DIVLABS::menu( $fields['content']['menu'], [
		'class' => implode( ' ', array_filter( [
			'divlabs-menu__menu w-fit flex flex-wrap-[inherit]',
			'gap-inherit',
			! empty( $fields['options']['wrap'] ) ? 'flex-wrap' : null,
			match ( $fields['options']['columns_mobile'] ?? false ) {
				//'1' => 'min-sm:max-xl:flex max-xl:flex-wrap',
				'2' => 'min-xs:max-xl:grid-cols-2 min-xs:max-xl:grid',
				'3' => 'min-xs:max-xl:grid-cols-3 min-xs:max-xl:grid',
				'4' => 'min-xs:max-xl:grid-cols-4 min-xs:max-xl:grid',
				default => null
			},
			match ( $fields['options']['columns_large'] ?? false ) {
				//'1' => 'xl:flex xl:flex-wrap',
				'2' => 'xl:grid-cols-2 xl:grid',
				'3' => 'xl:grid-cols-3 xl:grid',
				'4' => 'xl:grid-cols-4 xl:grid',
				default => null
			},
		] ) ),
		'depth' => match ( $block->type ?? false ) {
			'dropdown', 'accordion', 'list' => 2,
			default => 1
		}
	] );

	?>

</nav>



