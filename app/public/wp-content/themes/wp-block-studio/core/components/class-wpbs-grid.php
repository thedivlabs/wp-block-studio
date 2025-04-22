<?php

class WPBS_Grid {

	private static WPBS_Grid $instance;

	private function __construct() {

		add_action( 'rest_api_init', function () {
			register_rest_route( 'wpbs/v1', "/layout-grid/",
				[
					'methods'             => 'POST',
					'accept_json'         => true,
					'callback'            => [ $this, 'render_grid' ],
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
		return WPBS::clean_array( [
			'queryArgs'           => [
				'post_type'      => sanitize_text_field( $attrs['queryArgs']['post_type'] ?? '' ) ?? null,
				'term'           => sanitize_text_field( $attrs['queryArgs']['term'] ?? '' ) ?? null,
				'taxonomy'       => sanitize_text_field( $attrs['queryArgs']['taxonomy'] ?? '' ) ?? null,
				'posts_per_page' => sanitize_text_field( $attrs['queryArgs']['posts_per_page'] ?? '' ) ?? null,
				'orderby'        => sanitize_text_field( $attrs['queryArgs']['orderby'] ?? '' ) ?? null,
				'order'          => sanitize_text_field( $attrs['queryArgs']['order'] ?? '' ) ?? null,
				'post__not_in'   => sanitize_text_field( $attrs['queryArgs']['post__not_in'] ?? '' ) ?? null,
			],
			'wpbs-loop-page-size' => sanitize_text_field( $attrs['wpbs-loop-page-size'] ?? '' ) ?? null,
			'wpbs-loop-type'      => sanitize_text_field( $attrs['wpbs-loop-type'] ?? '' ) ?? null,
		] );
	}

	public static function query( $attrs, $page = 1 ): WP_Query|bool {

		$query_args = [
			'post_type'      => $attrs['queryArgs']['post_type'] ?? 'post',
			'posts_per_page' => $attrs['queryArgs']['posts_per_page'] ?? get_option( 'posts_per_page' ),
			'orderby'        => $attrs['queryArgs']['orderby'] ?? 'date',
			'order'          => $attrs['queryArgs']['order'] ?? 'DESC',
			'post__not_in'   => $attrs['queryArgs']['post__not_in'] ?? [],
			'paged'          => $page ?: 1,
		];

		if ( ! empty( $attrs['queryArgs']['taxonomy'] ) ) {

			$taxonomy = get_term( $attrs['queryArgs']['term'] )->taxonomy ?? false;

			$query_args['tax_query'] = [
				[
					'taxonomy' => $taxonomy,
					'field'    => 'term_id',
					'terms'    => $attrs['queryArgs']['term'] ?? false,
				]
			];
		}

		return new WP_Query( $query_args );

	}

	public static function render_style( $attributes ): string|bool {

		$breakpoints       = WPBS_Style::get_breakpoint();
		$breakpoint_large  = $breakpoints[ $attributes['wpbs-breakpoint-large'] ?? 'normal' ] ?? null;

		WPBS_Blocks::render_block_styles($attributes ?? false);

		add_filter( 'wpbs_preload_images_responsive', function ( $images ) use ( $attributes, $breakpoint_large ) {

			$block_images = array_map( function ( $image ) use ( $attributes, $breakpoint_large ) {
				return array_merge( $image, [
					'breakpoint' => $breakpoint_large
				] );
			}, $attributes['preload'] ?? [] );

			return array_merge( $images, $block_images );

		} );

		//return $css;

		return true;

	}

	public function render_grid( WP_REST_Request $request ): WP_REST_Response|WP_Error {

		$params = $request->get_params();

		$attrs         = $params['attrs'] ?? false;
		$page          = $params['page'] ?? false;
		$card          = $params['card'] ?? false;
		$current_query = $params['query'] ?? false;

		if ( ! empty( $current_query ) ) {
			$query = new WP_Query( array_merge( [
				'paged' => $page
			], $current_query ) );
		} else {
			$query = self::query( $attrs, $page );
		}

		$new_content = '';

		$css = '';

		while ( $query->have_posts() ) {

			$query->the_post();

			$block_template = $card;

			$unique_id = join( ' ', array_filter( [
				//$block_template['attrs']['uniqueId'] ?? null,
				'wpbs-layout-grid-card-' . get_the_ID()
			] ) );

			$new_block = new WP_Block( $block_template, array_filter( [
				'postId' => get_the_ID(),
			] ) );

			$new_block->inner_content[0]       = str_replace( $block_template['attrs']['uniqueId'] ?? '', $unique_id, $new_block->inner_content[0] );
			$new_block->inner_html             = str_replace( $block_template['attrs']['uniqueId'] ?? '', $unique_id, $new_block->inner_html );
			$new_block->attributes['uniqueId'] = $unique_id;

			$new_content .= $new_block->render();

			$new_block->attributes['postId'] = get_the_ID();

			$css .= WPBS_Style::block_styles( $new_block->attributes ?? false, $new_block );

		}

		wp_reset_postdata();

		return new WP_REST_Response(
			[
				'status'   => 200,
				'response' => ! empty( $new_content ) ? $new_content : false,
				'last'     => $query->get( 'paged' ) >= $query->max_num_pages,
				'card'     => $card,
				'query'    => $query,
				'css'      => $css
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


