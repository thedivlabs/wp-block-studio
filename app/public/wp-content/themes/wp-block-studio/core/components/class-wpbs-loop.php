<?php

class WPBS_Loop {

	public string $content;
	public string $css;
	public string $pagination_label;
	public bool $is_last;
	public bool $is_query;
	public bool $is_current;
	public bool $is_pagination;
	public array|WP_Query $query;


	public function __construct( $block, $page = 1 ) {

		$card  = $block->parsed_block['innerBlocks'][0] ?? false;
		$query = $block->attributes['wpbs-query'] ?? false;

		if ( empty( $card ) || empty( $query ) ) {
			return [];
		}

		$this->is_current       = $query['type'] == 'current';
		$this->is_pagination    = ! empty( $query['pagination'] );
		$this->pagination_label = $query['pagination-label'] ?? 'Show More';

		$new_content = '';
		$css         = '';

		$query = $this->loop_query( $query, $page );

		$this->is_query = is_a( $query, 'WP_Query' );
		$this->is_last  = $this->is_query && $page >= ( $query->max_num_pages ?? 1 ) || is_array( $query );

		if ( $this->is_query && $query->have_posts() ) {

			$query_counter = 0;

			while ( $query->have_posts() ) {

				$query->the_post();

				$new_block = $this->loop_card( $card, [
					'postId' => get_the_id(),
				], $query_counter );

				$query_counter ++;

				$new_content .= $new_block->render();
				$css         .= $new_block->attributes['wpbs-css'] ?? '';

			}

			wp_reset_postdata();

		}

		if ( ! $this->is_query && is_array( $query ) ) {

			foreach ( $query as $k => $term_id ) {

				$term = get_term( $term_id );

				if ( ! is_a( $term, 'WP_Term' ) ) {
					continue;
				}

				$new_block = $this->loop_card( $card, [
					'termId' => $term->term_id,
				], $k );

				$css         .= $new_block->attributes['wpbs-css'] ?? '';
				$new_content .= $new_block->render();

			}

		}

		return array_filter( [
			'content' => $new_content,
			'css'     => $css,
			'last'    => $this->is_last,
			'query'   => $query
		] );

	}

	private function loop_card( $block = [], $args = [], $index = false ): WP_Block|bool {

		$block_template = WPBS::sanitize_block_template( $block );

		$original_id = $block_template['attrs']['uniqueId'] ?? '';

		$post_id = $args['postId'] ?? get_the_ID();
		$term_id = $args['termId'] ?? false;

		$new_id = ! empty( $term_id ?? $post_id ?? null ) ? $original_id . '--' . ( $term_id ?: $post_id ) : null;

		$unique_id = join( ' ', array_filter( [
			$original_id ?? null,
			$new_id
		] ) );

		$selector = '.' . join( '.', array_filter( [
				$original_id ?? null,
				$new_id
			] ) );

		$block_template['attrs']['postId']   = $post_id;
		$block_template['attrs']['termId']   = $term_id;
		$block_template['attrs']['uniqueId'] = $unique_id;
		$block_template['attrs']['index']    = $index;

		$new_block = new WP_Block( $block_template, array_filter( [
			'termId'   => $term_id,
			'postId'   => $post_id,
			'uniqueId' => $unique_id,
			'index'    => $index,
		] ) );

		$new_block = apply_filters( 'wpbs_loop_block', $new_block, $original_id, $selector );

		$new_block->inner_content[0] = str_replace( $original_id, $unique_id, $new_block->inner_content[0] ?? '' );
		$new_block->inner_html       = str_replace( $original_id, $unique_id, $new_block->inner_html ?? '' );

		return $new_block;
	}

	private function loop_query( $query, $page = 1 ): WP_Query|bool|array {

		if ( empty( $query ) ) {
			return false;
		}

		if ( is_a( $query, 'WP_Query' ) ) {
			return $query;
		}

		if ( ! empty( $query['loop_terms'] ) ) {

			return get_terms( [
				'taxonomy'   => $query['taxonomy'] ?? false,
				'hide_empty' => true,
				'orderby'    => $query['orderby'] ?? 'date',
				'order'      => $query['order'] ?? 'DESC',
			] );
		}

		$query_args = [
			'post_type'      => $query['post_type'] ?? 'post',
			'posts_per_page' => $query['posts_per_page'] ?? get_option( 'posts_per_page' ),
			'orderby'        => $query['orderby'] ?? 'date',
			'order'          => $query['order'] ?? 'DESC',
			'post__not_in'   => $query['post__not_in'] ?? [],
			'paged'          => $query['paged'] ?? $page ?: 1,
		];

		if ( ! empty( $query['taxonomy'] ) && ! empty( $query['term'] ) ) {

			$query_args['tax_query'] = [
				[
					'taxonomy' => $query['taxonomy'],
					'field'    => 'term_id',
					'terms'    => $query['term'],
				]
			];

		}

		return new WP_Query( $query_args );

	}

	public function pagination( $query ): string|bool {

		if ( ! $this->is_pagination ) {
			return false;
		}

		if ( ! $this->is_current ) {
			echo '<button type="button" class="wpbs-layout-grid__button h-10 px-4 relative z-20 hidden" data-wp-on-async--click="actions.pagination">' . $this->pagination_label . '</button>';
		}


		if ( ! is_a( $query, 'WP_Query' ) ) {
			return false;
		}

		$big = 999999999;

		$current_page = max( 1, get_query_var( 'paged' ) );

		$base = str_replace( $big, '%#%', esc_url( get_pagenum_link( $big ) ) );

		$pagination_links = array_map( function ( $link ) use ( $current_page ) {
			return str_replace( [ '<span', '</span>', 'current' ], [
				'<button type="button" disabled',
				'</button>',
				'current wp-element-button ',
			], $link );
		}, paginate_links( [
			'base'      => $base,
			'format'    => '/page/%#%/',
			'current'   => $current_page,
			'total'     => $query->max_num_pages,
			'prev_next' => false,
			'mid_size'  => 6,
			'type'      => 'array',
		] ) );

		if ( ! empty( $pagination_links ) ) {
			do_blocks( '<!-- wp:query-pagination --><!-- wp:query-pagination-previous /--><!-- wp:query-pagination-numbers {"className":"inline-flex w-max"}  /--><!-- wp:query-pagination-next /--><!-- /wp:query-pagination -->' );

			return implode( ' ', [
				'<nav class="wp-block-query-pagination mt-8" aria-label="Pagination">',
				'<div class="wp-block-query-pagination-numbers inline-flex w-max">' . implode( '', $pagination_links ) . '</div>',
				'</nav>'
			] );
		} else {
			return false;
		}
	}


}


