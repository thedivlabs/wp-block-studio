<?php

class WPBS_Media_Gallery {

	private static WPBS_Media_Gallery $instance;

	public const SINGULAR = 'Media Gallery';
	public const PLURAL = 'Media Galleries';
	public const SLUG = 'media-gallery';

	public const TAX_SINGULAR = 'Gallery Category';
	public const TAX_PLURAL = 'Gallery Categories';
	public const TAX_SLUG = 'media-gallery-category';


	private function __construct() {


		$args = [
			'supports'      => [ 'title', 'editor', 'permalink', 'thumbnail', 'excerpt' ],
			'menu_position' => 25,
			'menu_icon'     => 'dashicons-format-gallery',
			'has_archive'   => 'media-gallery',
			'taxonomies'    => [
				'media-gallery-category'
			]
		];

		$labels = [
			'menu_name' => 'Media Gallery',
			'archives'  => 'Media Gallery',
		];

		WPBS_CPT::register( self::SINGULAR, self::PLURAL, self::SLUG, $args, $labels );

		WPBS_Taxonomy::register( self::TAX_SINGULAR, self::TAX_PLURAL, self::SLUG, self::TAX_SLUG, false );

	}

	public static function init(): WPBS_Media_Gallery {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Media_Gallery();
		}

		return self::$instance;
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
			'blockName'   => 'wpbs/video',
			'attrs'       => [ 'wpbs-video' => $merged ],
			'innerBlocks' => [],
		];

		$instance = new WP_Block( $block );

		return $instance->render();
	}


	protected function render_image( array $args ): string {
		$resolution = $args['resolution'] ?? 'large';

		$attr = [];
		if ( ! empty( $args['contain'] ) ) {
			$attr['style'] = 'object-fit: contain;';
		}

		return wp_get_attachment_image( $this->id, $resolution, false, $attr );
	}
}

