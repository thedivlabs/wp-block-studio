<?php

if ( ! empty( $args['taxonomy'] ) ) {
	$row = &$args;
} else {
	return false;
}


$tax = get_taxonomy( $row['taxonomy'] );

if ( ! is_a( $tax, 'WP_Taxonomy' ) ) {
	return false;
}

$terms = get_terms( [
	'taxonomy'   => $tax->name,
	'hide_empty' => false,
	'orderby'    => match ( $row['options']['sort'] ?? false ) {
		'menu-order' => 'menu-order',
		default => 'name',
	},
	'order'      => match ( $row['options']['sort'] ?? false ) {
		'menu-order' => 'ASC',
		default => 'DESC',
	},
] );

if ( empty( $terms ) ) {
	return false;
}

$title = $row['title'] ?? $tax->label ?? false;
?>
    <li class="w-full flex flex-col gap-5 rounded">
		<?php if ( $title ) { ?>
            <h2 class="h3 mb-0"><?= $title ?></h2>
		<?php } ?>
        <div class="w-full flex flex-col gap-7">
            <ul class="w-full flex flex-col gap-4 !list-none !p-0">
				<?php foreach ( $terms as $term ) {
					if ( ! is_a( $term, 'WP_Term' ) ) {
						continue;
					}
					?>
                    <li class="w-full flex flex-wrap justify-start gap-3 text-base leading-[1.5rem] items-top">
                        <i class="fa-solid fa-arrow-up-right-from-square h-[1.5rem] !leading-[1.5rem] text-xs block opacity-50 max-sm:hidden"></i>
                        <a href="<?= get_term_link( $term ) ?>"
                           class="block my-auto text-base leading-[1.5rem]"
                        >
							<?= $term->name ?>
                        </a>
                    </li>
				<?php } ?>
            </ul>
        </div>
    </li>
<?php