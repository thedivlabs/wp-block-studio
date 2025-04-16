<?php

global $wp_query;


$css = WPBS_Style::block_styles( $attributes ?? [], $block ?? false );


$pagination = paginate_links( array(
	'base'    => str_replace( 99999, '%#%', esc_url( get_pagenum_link( 99999 ) ) ),
	'format'  => '?paged=%#%',
	'current' => max( 1, get_query_var( 'paged' ) ),
	'total'   => $wp_query->max_num_pages
) );

/*
 *
 * <button type="button" class="w-full h-10 relative hidden" data-wp-on-async--click="actions.pagination" >Load More</button>
 *
 * */


?>


<?php echo $content ?? false; ?>
