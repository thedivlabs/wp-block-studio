<?php

class WPBS_Grid {

	private static WPBS_Grid $instance;

	private function __construct() {

		add_action( 'rest_api_init', function () {
			register_rest_route( 'wpbs/v1', "/layout-grid/",
				[
					'methods'             => 'POST',
					'accept_json'         => true,
					'callback'            => [ $this, 'rest_request' ],
					'permission_callback' => function () {
						$nonce = $_SERVER['HTTP_X_WP_NONCE'] ?? null;

						return $nonce && wp_verify_nonce( $nonce, 'wp_rest' );
					},
					'args'                => [
						'page'  => [
							'type'              => 'integer',
							'default'           => 1,
							'sanitize_callback' => 'absint',
						],
						'attrs' => [
							'type'              => 'object',
							'sanitize_callback' => [ 'WPBS_Grid', 'sanitize_loop_attrs' ],

						],
						'card'  => [
							'type'              => 'object',
							'sanitize_callback' => [ 'WPBS_Grid', 'sanitize_block_template' ],
						],
						'query' => [
							'type'              => 'array',
							'sanitize_callback' => [ 'WPBS', 'sanitize_query_args' ],
						],
					],
				]
			);
		} );


	}

	public static function recursive_sanitize( $input ) {

		if ( is_array( $input ) ) {
			$sanitized = [];

			foreach ( $input as $key => $value ) {

				$sanitized_key = is_string( $key ) ? sanitize_text_field( $key ) : $key;

				$sanitized[ $sanitized_key ] = self::recursive_sanitize( $value );
			}

			return $sanitized;

		} elseif ( is_string( $input ) ) {
			return sanitize_text_field( $input );

		} elseif ( is_int( $input ) ) {
			return intval( $input );

		} elseif ( is_float( $input ) ) {
			return floatval( $input );

		} elseif ( is_bool( $input ) ) {
			return (bool) $input;

		} else {

			return $input;
		}
	}

	public static function sanitize_block_template( $block ): array {

		return [
			'blockName'    => $block['blockName'] ?? '',
			'attrs'        => array_map( [ __CLASS__, 'recursive_sanitize' ], $block['attrs'] ?? [] ),
			'innerBlocks'  => array_map( [ __CLASS__, 'sanitize_block_template' ], $block['innerBlocks'] ?? [] ),
			'innerHTML'    => wp_kses_post( $block['innerHTML'] ?? '' ),
			'innerContent' => array_map( function ( $item ) {
				if ( is_string( $item ) ) {
					return wp_kses_post( $item );
				}

				return null;
			}, $block['innerContent'] ?? [] ),
		];

	}

	public static function sanitize_loop_attrs( $attrs ): array {

		$query = $attrs['wpbs-query'] ?? false;

		return WPBS::clean_array( [
			'queryArgs'           => [
				'post_type'      => sanitize_text_field( $query['post_type'] ?? '' ) ?? null,
				'term'           => sanitize_text_field( $query['term'] ?? '' ) ?? null,
				'taxonomy'       => sanitize_text_field( $query['taxonomy'] ?? '' ) ?? null,
				'posts_per_page' => sanitize_text_field( $query['posts_per_page'] ?? '' ) ?? null,
				'orderby'        => sanitize_text_field( $query['orderby'] ?? '' ) ?? null,
				'order'          => sanitize_text_field( $query['order'] ?? '' ) ?? null,
				'post__not_in'   => sanitize_text_field( $query['post__not_in'] ?? '' ) ?? null,
			],
			'wpbs-loop-page-size' => sanitize_text_field( $attrs['wpbs-loop-page-size'] ?? '' ) ?? null,
			'wpbs-loop-type'      => sanitize_text_field( $attrs['wpbs-loop-type'] ?? '' ) ?? null,
		] );
	}

	public static function query( $attrs, $page = 1, $current_query = [] ): WP_Query|bool|array {

		$query = $attrs['wpbs-query'] ?? $current_query ?? false;

		if ( empty( $query ) ) {
			return false;
		}

		if ( ! empty( $query['term'] ) ) {

			return get_terms( [
				'taxonomy'   => $query['taxonomy'] ?? false,
				'hide_empty' => true,
			] );
		}

		$query_args = [
			'post_type'      => $query['post_type'] ?? 'post',
			'posts_per_page' => $query['posts_per_page'] ?? get_option( 'posts_per_page' ),
			'orderby'        => $query['orderby'] ?? 'date',
			'order'          => $query['order'] ?? 'DESC',
			'post__not_in'   => $query['post__not_in'] ?? [],
			'paged'          => $page ?: 1,
		];

		if ( ! empty( $query['taxonomy'] ) ) {

			$taxonomy = get_term( $query['term'] ?? false )->taxonomy ?? false;

			if ( ! empty( $taxonomy ) ) {
				$query_args['tax_query'] = [
					[
						'taxonomy' => $taxonomy,
						'field'    => 'term_id',
						'terms'    => $query['term'] ?? false,
					]
				];
			}

		}

		return new WP_Query( $query_args );

	}

	private static function loop_card( $card = [], $args = [] ): WP_Block|bool {

		$block_template = $card;
		$original_id    = $block_template['attrs']['uniqueId'] ?? '';

		$post_id = $args['term_id'] ?? get_the_ID();

		$unique_id = join( ' ', array_filter( [
			$original_id ?? null,
			$original_id . '--' . $post_id
		] ) );

		$selector = '.' . join( '.', array_filter( [
				$original_id ?? null,
				$original_id . '--' . $post_id
			] ) );

		$block_template['attrs']['postId']   = $post_id;
		$block_template['attrs']['termId']   = $args['termId'] ?? 0;
		$block_template['attrs']['uniqueId'] = $unique_id;

		$new_block = new WP_Block( $block_template, array_filter( [
			'termId'   => $args['termId'] ?? 0,
			'postId'   => $post_id,
			'uniqueId' => $unique_id
		] ) );

		$new_block = apply_filters( 'wpbs_loop_block', $new_block, $original_id, $selector );

		$new_block->inner_content[0] = str_replace( $original_id, $unique_id, $new_block->inner_content[0] );
		$new_block->inner_html       = str_replace( $original_id, $unique_id, $new_block->inner_html );

		return $new_block;
	}

	public static function render( $attrs = [], $page = 1, $card = [], $current_query = [] ): array|bool {

		$query = match ( true ) {
			is_a( $current_query, 'WP_Query' ), ! empty( $attrs['wpbs-query']['loop_terms'] ) && ! empty( $attrs['wpbs-query']['taxonomy'] ) && is_array( $current_query ) => $current_query,
			default => self::query( $attrs, $page, $current_query )
		};

		$new_content = '';
		$css         = '';

		if ( is_a( $query, 'WP_Query' ) ) {
			while ( $query->have_posts() ) {

				$query->the_post();

				$new_block = self::loop_card( $card );

				$new_content .= $new_block->render();
				$css         .= $new_block->attributes['wpbs-css'] ?? '';

			}

			wp_reset_postdata();

			return array_filter( [
				'content' => ! empty( $new_content ) ? $new_content : false,
				'last'    => $query->get( 'paged' ) >= $query->max_num_pages,
				'query'   => $query,
				'css'     => trim( $css ),
			] );
		}

		if ( is_array( $query ) && ! empty( $attrs['wpbs-query']['loop_terms'] ) ) {

			foreach ( $query as $k => $term_obj ) {

				$new_block = self::loop_card( $card, [
					'termId' => $term_obj->term_id,
				] );

				$new_content .= $new_block->render();

			}


		}


		return array_filter( [
			'content' => $new_content,
			'last'    => false,
			'query'   => $query,
		] );


	}

	public function rest_request( WP_REST_Request $request ): WP_REST_Response|WP_Error {

		$params = $request->get_params();

		$grid = self::render( $params['attrs'] ?? false, $params['page'] ?? 1, $params['card'] ?? false, $params['query'] ?? false );

		return new WP_REST_Response(
			[
				'status'   => 200,
				'response' => $grid['content'] ?? false,
				'last'     => $grid['last'] ?? false,
				'query'    => $grid['query'] ?? false,
				'css'      => $grid['css'] ?? false
			]
		);

	}

	public static function init(): WPBS_Grid {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Grid();
		}

		return self::$instance;
	}

}


