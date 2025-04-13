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
					],
				]
			);
		} );


	}

	public static function sanitize_block_template( $block ) {
		return $block;
	}

	public static function sanitize_loop_attrs( $attrs ): array {
		return $attrs;
	}

	public static function query( $attrs, $page = 1 ): WP_Query|bool {


		if ( ( $attributes['wpbs-loop-type'] ?? false ) === 'current' ) {
			global $wp_query;

			return $wp_query;
		}


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
					'terms'    => $attrs['queryArgs']['term'],
				]
			];
		}

		return new WP_Query( $query_args );

	}

	public static function render_style( $attributes ): void {

		$breakpoints       = WPBS_Style::get_breakpoint();
		$breakpoint_mobile = $breakpoints[ $attributes['wpbs-breakpoint-mobile'] ?? 'xs' ];
		$breakpoint_small  = $breakpoints[ $attributes['wpbs-breakpoint-small'] ?? 'md' ];
		$breakpoint_large  = $breakpoints[ $attributes['wpbs-layout-breakpoint'] ?? $attributes['wpbs-breakpoint-large'] ?? 'normal' ];

		$selector = match ( true ) {
			! empty( $attributes['uniqueId'] ) => '.' . join( '.', explode( ' ', $attributes['uniqueId'] ) ),
			! empty( $attributes['className'] ) => '.' . join( '.', explode( ' ', $attributes['className'] ) ),
			default => false
		};

		$attributes['wpbs-prop-row-gap']    = WPBS::parse_wp_css_variable( $attributes['style']['spacing']['blockGap']['left'] ?? '0px' );
		$attributes['wpbs-prop-column-gap'] = WPBS::parse_wp_css_variable( $attributes['style']['spacing']['blockGap']['top'] ?? '0px' );

		$total = ! empty( $query ) ? count( $query->posts ?? [] ) : count( $block->parsed_block['innerBlocks'] ?? [] );

		$cols_mobile     = intval( $attributes['wpbs-columns-mobile'] ?? false ) ?: 1;
		$cols_small      = intval( $attributes['wpbs-columns-small'] ?? false ) ?: 2;
		$cols_large      = intval( $attributes['wpbs-columns-large'] ?? $attributes['wpbs-columns-small'] ?? $attributes['wpbs-columns-mobile'] ?? false ) ?: 1;
		$last_row_mobile = ( $total - ( floor( $total / $cols_mobile ) * $cols_mobile ) ) ?: $cols_mobile;
		$last_row_small  = ( $total - ( floor( $total / $cols_small ) * $cols_small ) ) ?: $cols_small;
		$last_row_large  = ( $total - ( floor( $total / $cols_large ) * $cols_large ) ) ?: $cols_large;

		$custom_css = '';

		if ( ! empty( $cols_mobile ) ) {

			$custom_css .= '@media screen and (max-width: calc(' . ( $breakpoint_mobile ) . ' - 1px)) {';

			$custom_css .= $selector . '{ --columns: ' . $cols_mobile . ' }';

			if ( ! empty( $attributes['wpbs-divider'] ) ) {
				$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( -n+' . $cols_mobile . '):after { height: calc(100% + (var(--row-gap, var(--column-gap)) / 2));top: 0; }';
				$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' . $cols_mobile . 'n ):before { width: calc(100% + calc(var(--column-gap) / 2)) !important; }';
				$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type( -n+' . $last_row_mobile . ' ):after { height: calc(100% + calc(var(--row-gap, var(--column-gap)) / 2)) !important; }';
				$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type( -n+' . $last_row_mobile . ' ):before { content: none; }';
				$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' . $cols_mobile . 'n+1 ):after { content: none; }';
				$custom_css .= $selector . ' .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' . $cols_mobile . 'n+1 ):before { width: ' . ( $cols_mobile > 1 ? 'calc(100% + calc(var(--column-gap) / 2))' : '100%' ) . ' !important;left: 0; }';
			}

			$custom_css .= '} ';
		}


		if ( ! empty( $cols_small ) ) {

			$custom_css .= '@media screen and (min-width: ' . $breakpoint_small . ') and (max-width: calc(' . $breakpoint_large . ' - 1px)) {';

			$custom_css .= $selector . '{ --columns: ' . $cols_small . ' }';

			if ( ! empty( $attributes['wpbs-divider'] ) ) {
				$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( -n+' . $cols_small . '):after { height: calc(100% + (var(--row-gap, var(--column-gap)) / 2));top: 0; }' . "\r\n";
				$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' . $cols_small . 'n ):before { width: calc(100% + calc(var(--column-gap) / 2)) !important; }' . "\r\n";
				$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type( -n+' . $last_row_small . ' ):after { height: calc(100% + calc(var(--row-gap, var(--column-gap)) / 2)) !important; }' . "\r\n";
				$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type( -n+' . $last_row_small . ' ):before { content: none; }' . "\r\n";
				$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' . $cols_small . 'n+1 ):after { content: none; }' . "\r\n";
				$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' . $cols_small . 'n+1 ):before { width: ' . ( $cols_small > 1 ? 'calc(100% + calc(var(--column-gap) / 2))' : '100%' ) . ' !important;left: 0; }' . "\r\n";
			}

			$custom_css .= '} ';
		}

		if ( ! empty( $cols_large ) ) {
			$custom_css .= '@media screen and (min-width: ' . ( $breakpoint_large ) . ') {';

			$custom_css .= $selector . '{ --columns: ' . $cols_large . ' }';

			if ( ! empty( $attributes['wpbs-divider'] ) ) {
				$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( -n+' . $cols_large . '):after { height: calc(100% + (var(--row-gap, var(--column-gap)) / 2));top: 0; }' . "\r\n";
				$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' . $cols_large . 'n ):before { width: calc(100% + calc(var(--column-gap) / 2)); }' . "\r\n";
				$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type( -n+' . $last_row_large . ' ):not(:nth-of-type( -n+' . $last_row_large . ' )):after { height: calc(100% + calc(var(--row-gap, var(--column-gap)) / 2)) !important; }' . "\r\n";
				$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type( -n+' . $last_row_large . ' ):after { height: 100% !important; }' . "\r\n";
				$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type( -n+' . $last_row_large . ' ):before { content: none !important; }' . "\r\n";
				$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' . $cols_large . 'n+1 ):after { content: none !important; }' . "\r\n";
				$custom_css .= $selector . ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' . $cols_large . 'n+1 ):before { width: ' . ( $cols_large > 1 ? 'calc(100% + calc(var(--column-gap) / 2))' : '100%' ) . '; left: 0; }' . "\r\n";
			}

			$custom_css .= '} ';
		}


		$css = WPBS_Style::block_styles( $attributes ?? false, $block ?? false, $custom_css );


		add_filter( 'wpbs_preload_images_responsive', function ( $images ) use ( $attributes, $breakpoint_large ) {

			$block_images = array_map( function ( $image ) use ( $attributes, $breakpoint_large ) {
				return array_merge( $image, [
					'breakpoint' => $breakpoint_large
				] );
			}, $attributes['preload'] ?? [] );

			return array_merge( $images, $block_images );

		} );


	}

	public function render_grid( WP_REST_Request $request ): WP_REST_Response|WP_Error {

		$params = $request->get_params();

		$attrs = $params['attrs'] ?? false;
		$page  = $params['page'] ?? false;
		$card  = $params['card'] ?? false;

		$query = self::query( $attrs, $page );

		$new_content = '';

		while ( $query->have_posts() ) {

			$query->the_post();

			setup_postdata( $query->post );

			global $post;

			$card['attrs']['postId'] = $post->ID;

			$block = new WP_Block( $card, [
				'postId' => get_the_ID(),
			] );

			$block->attributes['postId'] = get_the_ID();

			$new_content .= $block->render();

		}

		wp_reset_postdata();

		return new WP_REST_Response(
			[
				'status'        => 200,
				'response'      => ! empty( $new_content ) ? $new_content : false,
				'body_response' => null
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


