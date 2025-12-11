<?php

class WPBS_Media_Gallery {

	private static WPBS_Media_Gallery $instance;

	public const SLUG = 'media-gallery';
	public const TAX_SLUG = 'media-gallery-category';

	private function __construct() {

		// CPT + Taxonomy
		WPBS_CPT::register(
			'Media Gallery', 'Media Galleries', self::SLUG,
			[
				'supports'      => [ 'title', 'editor', 'thumbnail', 'excerpt' ],
				'menu_position' => 25,
				'menu_icon'     => 'dashicons-format-gallery',
				'has_archive'   => self::SLUG,
			],
			[
				'menu_name' => 'Media Gallery',
				'archives'  => 'Media Gallery',
			]
		);

		WPBS_Taxonomy::register(
			'Gallery Category', 'Gallery Categories',
			self::SLUG, self::TAX_SLUG, false
		);

		// REST
		add_action( 'rest_api_init', [ $this, 'register_rest_endpoints' ] );
	}

	public static function init(): WPBS_Media_Gallery {
		return self::$instance ??= new WPBS_Media_Gallery();
	}

	// ---------------------------------------------------------
	// REST ENDPOINTS
	// ---------------------------------------------------------

	public function register_rest_endpoints(): void {

		register_rest_route( 'wpbs/v1', '/lightbox', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'render_lightbox' ],
			'permission_callback' => '__return_true',
			'args'                => [
				'media'    => [
					'type'     => 'array',
					'required' => true,
				],
				'index'    => [
					'type'    => 'integer',
					'default' => 0,
				],
				'settings' => [
					'type'    => 'object',
					'default' => [],
				],
			],
		] );
	}

	// ---------------------------------------------------------
	// LIGHTBOX SSR
	// ---------------------------------------------------------

	public function render_lightbox( WP_REST_Request $request ): WP_REST_Response {

		$media_items = $request->get_param( 'media' ) ?? [];
		$settings    = $request->get_param( 'settings' ) ?? [];
		$index       = intval( $request->get_param( 'index' ) ?? 0 );

		if ( empty( $media_items ) ) {
			return new WP_REST_Response( [
				'success'  => false,
				'rendered' => '',
			], 200 );
		}

		// -----------------------------------------------------
		// Build slide HTML using existing wpbs/slide block
		// -----------------------------------------------------
		$slides_html = '';

		foreach ( $media_items as $i => $item ) {

			// Inject loop-style block context
			$context = [
				'wpbs/query' => $settings,     // resolution, lightbox, eager, etc.
				'wpbs/media' => $item,
				'wpbs/index' => $i,
			];

			$block = new WP_Block( [
				'blockName'   => 'wpbs/slide',
				'attrs'       => [
					'className' => 'wpbs-lightbox-slide'
				],
				'innerBlocks' => []
			], $context );

			$slides_html .= $block->render();
		}

		// -----------------------------------------------------
		// Lightbox Skeleton
		// -----------------------------------------------------
		$html = '
		<div class="wpbs-lightbox" data-start="' . esc_attr( $index ) . '">
			<div class="wpbs-slider swiper wpbs-lightbox-swiper">
				<div class="swiper-wrapper">
					' . $slides_html . '
				</div>
				<div class="wpbs-lightbox-nav">
					<button class="wpbs-lightbox-nav__button wpbs-slider-button--prev wpbs-lightbox-nav__button--prev swiper-button-prev" aria-label="Previous">
						<span class="screen-reader-text">Previous slide</span>
						<span class="wpbs-icon material-symbols-outlined">arrow_back</span>
					</button>
					<div class="wpbs-lightbox-nav__pagination swiper-pagination"></div>
					<button class="wpbs-lightbox-nav__button wpbs-slider-button--next wpbs-lightbox-nav__button--next swiper-button-next" aria-label="Next">
						<span class="screen-reader-text">Next slide</span>
						<span class="wpbs-icon material-symbols-outlined">arrow_forward</span>
					</button>
				</div>

			</div>
		</div>';

		return new WP_REST_Response( [
			'success'      => true,
			'rendered'     => $html,
			'$media_items' => $media_items,
			'$slides_html' => $slides_html,
		], 200 );
	}
}


class WPBS_Media {

	/** @var int|array|null */
	protected int|array|null $raw;

	/** @var string|null  'image' | 'video' | null */
	protected ?string $type = null;

	/** @var int|null  Attachment ID for images */
	protected ?int $id = null;

	/** @var int|null  Attachment ID for images */
	protected ?int $index = null;

	/** @var array|null  Video metadata array */
	protected ?array $video = null;

	/** @var array  Rendering arguments */
	protected array $args = [];

	/**
	 * @param int|array|null $item
	 * @param array $args
	 */
	public function __construct( int|array|null $item, array $args = [], $index = null ) {
		$this->raw   = $item;
		$this->args  = $args;
		$this->index = $index;

		// ---------------------------
		// CASE 1: Video array
		// ---------------------------
		if ( is_array( $item ) && ! empty( $item ) ) {

			if ( ! empty( $item['link'] ) || ! empty( $item['share_link'] ) ) {
				$this->type  = 'video';
				$this->video = $item;

				return;
			}
		}

		// ---------------------------
		// CASE 2: Image ID
		// ---------------------------
		if ( is_int( $item ) && $item > 0 ) {
			$this->type = 'image';
			$this->id   = $item;

			return;
		}

		// ---------------------------
		// CASE 3: Invalid or empty
		// ---------------------------
		$this->type = null;
	}

	public function render( array $override = [] ): string {
		$args = array_merge( $this->args, $override );

		return match ( $this->type ) {
			'video' => $this->render_video( $args ),
			'image' => $this->render_image( $args ),
			default => '',
		};
	}

	protected function render_video( array $args ): string {

		$is_rest = wp_is_json_request();

		// Merge ACF video props + settings
		$merged = array_merge( $this->video, $args, [ 'disabled' => ! $is_rest, 'lightbox' => ! $is_rest ] );

		$is_lightbox = ! empty( $args['lightbox'] );

		$block = [
			'blockName'   => 'wpbs/video-element',
			'attrs'       => [
				'wpbs-video' => $merged,
				'className'  => implode( ' ', array_filter( [
					'w-full h-full',
				] ) ),
			],
			'innerBlocks' => [],
		];


		$instance = new WP_Block( $block, [
			'wpbs/index' => $this->index ?? null,
		] );

		return $instance->render();
	}

	protected function render_image( array $args ): string {
		$resolution = $args['resolution'] ?? 'large';

		$is_lightbox = ! empty( $args['lightbox'] );

		$attr = [
			'class'      => implode( ' ', array_filter( [
				'w-full h-full',
				! empty( $args['contain'] ) ? 'object-contain' : 'object-cover',
				$is_lightbox ? '--lightbox' : 'object-cover',
			] ) ),
			'data-index' => $this->index ?? null,
		];

		return wp_get_attachment_image( $this->id, $resolution, false, $attr );
	}
}

