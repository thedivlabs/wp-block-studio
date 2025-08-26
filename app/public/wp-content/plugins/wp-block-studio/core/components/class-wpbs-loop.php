<?php

class WPBS_Loop {

	public string $content;
	public array $card;
	public string $css;
	public string $pagination_label;
	public bool $is_last;
	public bool $is_rest;
	public bool $is_query;
	public bool $is_term_loop;
	public bool $is_current;
	public bool $is_related;
	public bool $is_menu_order;
	public bool $is_pagination;
	public array|WP_Query $query;


	public function __construct( WP_Block|false|array $block, $query = false, $page = 1, $is_rest = false ) {

		$block = is_a( $block, 'WP_Block' ) ? $block->parsed_block['innerBlocks'][0] ?? false : $block;

		$card = WPBS::get_block_template( $block );

		$query = $query ?: $block->attributes['wpbs-query'] ?? false;

		if ( empty( $card ) || empty( $query ) ) {
			return;
		}

		$this->is_menu_order    = ! empty( $query['menu_order'] );
		$this->is_term_loop     = ! empty( $query['loop_terms'] );
		$this->is_current       = ( $query['post_type'] ?? false ) == 'current';
		$this->is_related       = ( $query['post_type'] ?? false ) == 'related';
		$this->is_pagination    = ! empty( $query['pagination'] );
		$this->pagination_label = $query['pagination-label'] ?? 'Show More';

		$new_content = '';
		$css         = '';


		$this->query = $this->loop_query( $query, $page );


		$this->is_rest  = ! empty( $is_rest );
		$this->is_query = is_a( $this->query, 'WP_Query' );
		$this->is_last  = ( $this->is_query && ( $this->query->query_vars['paged'] ?? 1 ) >= ( $this->query->max_num_pages ?? 1 ) ) || is_array( $this->query );

		if ( $this->is_query && $this->query->have_posts() ) {


			$query_counter = 0;

			while ( $this->query->have_posts() ) {
				$this->query->the_post();

				$new_block = $this->loop_card( $card, [
					'wpbs/postId' => get_the_id(),
				], $query_counter, $is_rest );

				$query_counter ++;

				$new_content .= $new_block->render();
				$css         .= $new_block->attributes['wpbs-css'] ?? '';

			}

			wp_reset_postdata();

		}

		if ( ! $this->is_query && is_array( $this->query ) ) {

			foreach ( $this->query as $k => $term_id ) {

				$term = get_term( $term_id );

				if ( ! is_a( $term, 'WP_Term' ) ) {
					continue;
				}

				$card['attrs']['termId'] = $term->term_id;

				$new_block = $this->loop_card( $card, [
					'wpbs/termId' => $term->term_id,
				], $k, $is_rest );

				$css         .= $new_block->attributes['wpbs-css'] ?? '';
				$new_content .= $new_block->render();

			}

		}

		$this->content = $new_content;
		$this->css     = $css;
		$this->card    = $card;

	}

	private function loop_card( $block_template = [], $args = [], $index = false, $is_rest = false ): WP_Block|bool {

		global $post;

		$original_id = $block_template['attrs']['uniqueId'] ?? '';

		$post_id = $post->ID ?? $block['attrs']['postId'] ?? $args['wpbs/postId'] ?? get_the_ID();
		$term_id = $block['attrs']['termId'] ?? $args['wpbs/termId'] ?? false;

		$new_id = $term_id || $post_id ? $original_id . '--' . ( $term_id ?: $post_id ) : null;


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
		$block_template['attrs']['is_rest']  = true;

		$new_block = new WP_Block( $block_template, array_filter( [
			'wpbs/termId'   => $term_id,
			'wpbs/postId'   => $post_id,
			'wpbs/uniqueId' => $unique_id,
			'wpbs/index'    => $index,
		] ) );

		return apply_filters( 'wpbs_loop_block', $new_block, $original_id, $selector );
	}

	private function loop_query( $query, $page = 1 ): WP_Query|bool|array {

		if ( empty( $query ) ) {
			return false;
		}

		if ( $this->is_current ) {
			global $wp_query;

			return $wp_query;
		}

		if ( $this->is_related ) {

			$id        = get_queried_object()?->term_id ?? get_the_id();
			$term      = is_tax() ? get_term( $id ) : false;
			$field_ref = $term ? "{$term->taxonomy}_{$term->term_id}" : $id;
			$post_ids  = get_field( 'wpbs_related_posts', $field_ref ) ?: get_field( 'wpbs_related' ) ?: [];

			return new WP_Query( array_filter( [
				'post_type'      => $query['post_type_filter'] ?? 'any',
				'post__in'       => $post_ids,
				'posts_per_page' => $query['posts_per_page'] ?? get_option( 'posts_per_page' ),
				'orderby'        => $this->is_menu_order ? 'menu_order' : $query['orderby'] ?? null,
				'order'          => $query['order'] ?? null,
				'post__not_in'   => $query['post__not_in'] ?? [],
				'paged'          => $query['paged'] ?? $page ?: 1,
			] ) );
		}

		if ( is_a( $query, 'WP_Query' ) ) {
			return $query;
		}

		if ( ! empty( $query['loop_terms'] ) ) {

			$terms = get_terms( array_filter( [
				'taxonomy'   => $query['taxonomy'] ?? false,
				'hide_empty' => true,
				'orderby'    => $this->is_menu_order ? 'menu_order' : $query['orderby'] ?? null,
				'order'      => $query['order'] ?? null,
			] ) );

			return $terms;
		}

		$query_args = [
			'post_type'      => $query['post_type'] ?? 'post',
			'posts_per_page' => intval( $query['posts_per_page'] ?? get_option( 'posts_per_page' ) ),
			'orderby'        => $this->is_menu_order ? 'menu_order' : $query['orderby'] ?? null,
			'order'          => $query['order'] ?? 'DESC',
			'post__in'       => $query['post__in'] ?? [],
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

		if ( ! $this->is_pagination || ! is_a( $query, 'WP_Query' ) ) {
			return false;
		}

		if ( ! $this->is_current && ! $this->is_last ) {
			echo ( new WP_Block( [
				'blockName' => 'wpbs/loop-pagination-button',
			], [
				'label' => $this->pagination_label ?? null
			] ) )->render();
		}


		if ( ! $this->is_current ) {
			return false;
		}
		$big = 999999999;

		$current_page = max( 1, get_query_var( 'paged' ) );

		$base = str_replace( $big, '%#%', esc_url( get_pagenum_link( $big ) ) );

		$pagination = paginate_links( [
			'base'      => $base,
			'format'    => '/page/%#%/',
			'current'   => $current_page,
			'total'     => $query->max_num_pages,
			'prev_next' => false,
			'mid_size'  => 6,
			'type'      => 'array',
		] );

		$pagination_links = array_map( function ( $link ) use ( $current_page ) {
			return str_replace( [ '<span', '</span>', 'current' ], [
				'<button type="button" disabled',
				'</button>',
				'current wp-element-button ',
			], $link );
		}, $pagination ?? [] );

		if ( ! empty( $pagination_links ) ) {
			do_blocks( '<!-- wp:query-pagination --><!-- wp:query-pagination-previous /--><!-- wp:query-pagination-numbers {"className":"inline-flex w-max"}  /--><!-- wp:query-pagination-next /--><!-- /wp:query-pagination -->' );

			return implode( ' ', [
				'<nav class="wp-block-query-pagination relative z-20" aria-label="Pagination">',
				'<div class="wp-block-query-pagination-numbers inline-flex w-max">' . implode( '', $pagination_links ) . '</div>',
				'</nav>'
			] );
		} else {
			return false;
		}
	}


}


