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

	public function register_rest_endpoints() {

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
				'attrs'       => [ 'uniqueId' => 'lightbox-slide-' . $i ],
				'innerBlocks' => [],
				'context'     => $context,
			] );

			$slides_html .= $block->render();
		}

		// -----------------------------------------------------
		// Lightbox Skeleton
		// -----------------------------------------------------
		$html = '
		<div class="wpbs-lightbox" data-start="' . esc_attr( $index ) . '">
			<div class="swiper wpbs-lightbox-swiper">
				<div class="swiper-wrapper">
					' . $slides_html . '
				</div>
			</div>
		</div>';

		return new WP_REST_Response( [
			'success'  => true,
			'rendered' => $html,
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

	/** @var array|null  Video metadata array */
	protected ?array $video = null;

	/** @var array  Rendering arguments */
	protected array $args = [];

	/**
	 * @param int|array|null $item
	 * @param array $args
	 */
	public function __construct( int|array|null $item, array $args = [] ) {
		$this->raw  = $item;
		$this->args = $args;

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

		// Merge ACF video props + settings
		$merged = array_merge( $this->video, $args );

		$block = [
			'blockName'   => 'wpbs/video-element',
			'attrs'       => [
				'wpbs-video' => $merged,
				'className'  => 'w-full h-full'
			],
			'innerBlocks' => [],
		];


		$instance = new WP_Block( $block );

		return $instance->render();
	}

	protected function render_image( array $args ): string {
		$resolution = $args['resolution'] ?? 'large';

		$attr = [
			'class' => implode( ' ', array_filter( [
				'w-full h-full',
				! empty( $args['contain'] ) ? 'object-contain' : 'object-cover',
				! empty( $args['lightbox'] ) ? '--lightbox' : 'object-cover',
			] ) )
		];

		return wp_get_attachment_image( $this->id, $resolution, false, $attr );
	}
}

