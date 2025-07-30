<?php

if ( ! empty( $args['post_type'] ) ) {
	$row = &$args;
} else {
	return false;
}

$cpt = get_post_type_object( $row['post_type'] );

if ( ! is_a( $cpt, 'WP_Post_Type' ) ) {
	return false;
}

$taxonomies = empty( $row['options']['hide_taxonomies'] ) ? array_filter( array_map( function ( $taxonomy ) {
	$terms = get_terms( [
		'taxonomy'   => $taxonomy,
		'hide_empty' => true
	] );
	if ( empty( $terms ) ) {
		return null;
	}

	return [
		'object' => get_taxonomy( $taxonomy ),
		'terms'  => $terms,
	];
}, array_keys( get_object_taxonomies( $cpt->name, 'objects' ) ) ) ) : false;

$posts = ( new WP_Query( [
	'post_type'      => $cpt->name,
	'no_found_rows'  => true,
	'posts_per_page' => - 1,
	'post_parent'    => 0,
	'post_status'    => 'publish',
	'post__not_in'   => $row['excluded_posts'] ?? [],
	'fields'         => 'ids',
	'orderby'        => match ( $row['options']['sort'] ?? false ) {
		'latest' => 'date',
		default => 'title'
	},
	'order'          => 'ASC',
] ) )->posts ?? [];

if ( empty( $posts ) ) {
	return false;
}
?>
    <li class="w-full flex flex-col gap-5 rounded">
        <h2 class="h3 mb-0"><?= $row['title'] ?? $cpt->label ?></h2>
        <div class="w-full flex flex-col gap-7">
            <ul class="w-full flex flex-col gap-4 !list-none !p-0">
				<?php foreach ( $posts as $post ) {
					$children = array_filter( get_children( [
						'post_parent' => $post,
						'numberposts' => - 1,
					] ), function ( $child_post ) {
						return ! in_array( $child_post->post_type ?? false, [
							false,
							'attachment'
						] );
					} );
					?>
                    <li class="w-full flex flex-wrap justify-start gap-3 text-base leading-[1.5rem] items-top">
                        <i class="fa-solid fa-arrow-up-right-from-square h-[1.5rem] !leading-[1.5rem] text-xs block opacity-50 max-sm:hidden"></i>
                        <a href="<?= get_the_permalink( $post ) ?>"
                           class="block my-auto text-base leading-[1.5rem]"
                        >
							<?= get_the_title( $post ) ?>
							<?php if ( ! empty( $row['options']['show_date'] ) ) { ?>
                                <small class="h-[1.5rem] block leading-[inherit] text-gray-500"><?= get_the_date( 'm/d/Y', $post ) ?></small>
							<?php } ?>
                        </a>
                    </li>
					<?php if ( ! empty( $children ) ) { ?>
                        <li>
                            <ul class="w-full flex flex-col gap-4 !list-none !p-0">
								<?php foreach ( $children as $child_post ) { ?>
                                    <li class="w-full flex flex-wrap justify-start gap-3 text-base leading-[1.5rem] items-top">
                                        <i class="fa-solid fa-arrow-up-right-from-square h-[1.5rem] leading-[1.5rem] text-xs block opacity-50 max-sm:hidden"></i>
                                        <i class="fa-regular fa-dash h-[1.5rem] !leading-[1.5rem] text-xs block opacity-50"></i>
                                        <a href="<?= get_the_permalink( $child_post ) ?>"
                                           class="block my-auto text-base leading-[1.5rem]">
											<?= get_the_title( $child_post ) ?>
											<?php if ( ! empty( $row['options']['show_date'] ) ) { ?>
                                                <small class="h-[1.5rem] block leading-[inherit] text-gray-500"><?= get_the_date( 'm/d/Y', $child_post ) ?></small>
											<?php } ?>
                                        </a>
                                    </li>
								<?php } ?>
                            </ul>
                        </li>
					<?php } ?>
				<?php } ?>
            </ul>
			<?php if ( ! empty( $taxonomies ) ) { ?>
                <ul class="w-full flex flex-col gap-3 text-sm leading-normal !list-none !p-0">
					<?php foreach ( $taxonomies as $tax ) {
						if ( empty( $tax['terms'] ) ) {
							continue;
						}
						?>
                        <strong><?= $tax['object']->label ?></strong>
                        <ul class="w-full flex flex-wrap gap-x-5 gap-y-0 justify-start items-baseline !list-none !p-0">
							<?php foreach ( $tax['terms'] as $term ) { ?>
                                <li>
                                    <a href="<?= get_term_link( $term ) ?>"
                                       class="hover:text-primary-hover">
										<?= $term->name ?>
                                    </a>
                                </li>
							<?php } ?>
                        </ul>
					<?php } ?>
                </ul>
			<?php } ?>
        </div>
    </li>
<?php