<?php


class WPBS_Review {

	private static WPBS_Review $instance;
	private static string $singular;
	private static string $plural;
	private static string $slug;

	private function __construct() {

		self::$singular = 'Review';
		self::$plural   = 'Reviews';
		self::$slug     = sanitize_title( self::$singular );

		$args = [
			'menu_icon'     => 'dashicons--reviews',
			'supports'      => [ 'title' ],
			'menu_position' => 25,
			'has_archive'   => 'reviews'
		];

		WPBS_CPT::register( self::$singular, self::$plural, self::$slug, $args, false, true, false, true, true );


	}

	public static function init(): WPBS_Review {
		if ( empty( self::$instance ) ) {
			self::$instance = new WPBS_Review();
		}

		return self::$instance;
	}


}


class WPBS_Review_Single {

	public int|bool $id;
	public int|bool $location;
	public string|bool $name;
	public string|bool $job_title;
	public string|bool $company;
	public string|bool $initials;
	public int|bool $rating;
	public string|bool $review;
	public string|bool $thumbnail;
	public array|bool $gallery;
	public int|bool $poster;
	public array|bool $video;
	public string|bool $date;
	public bool $is_google;


	function __construct( $review = false, $args = [] ) {

		if ( ! empty( $review->comment_type ) ) {
			$meta = get_comment_meta( $review->comment_ID ?? false );
		} else {
			$review = get_post( $review );
			$fields = WPBS::clean_array( get_field( 'wpbs', $review ) );
		}

		$this->id        = $review->comment_ID ?? $review->ID ?? false;
		$this->name      = $review->comment_author ?? get_the_title( $review );
		$this->job_title = $fields['details']['job_title'] ?? false;
		$this->initials  = $fields['details']['initials'] ?? false;
		$this->company   = $fields['details']['company'] ?? false;
		$this->gallery   = $fields['media']['gallery'] ?? false;
		$this->rating    = $meta['rating'][0] ?? $fields['review']['rating'] ?? 5;
		$this->review    = $review->comment_content ?? $fields['review']['full_review'] ?? false;
		$this->thumbnail = $meta['avatar'][0] ?? wp_get_attachment_image_src( $fields['media']['featured']['thumbnail'] ?? false, 'small' )[0] ?? '#';
		$this->poster    = $fields['media']['featured']['poster'] ?? false;
		$this->video     = $fields['media']['video'] ?? false;
		$this->date      = $fields['details']['date'] ?? $review->comment_date ?? false;
		$this->is_google = ! empty( $review->comment_ID ) || ! empty( $fields['options']['google_review'] );
	}

	public function date(): string {
		return ! empty( $this->date ) ? date( 'F Y', strtotime( $this->date ) ) : get_the_date( false, $this->id );
	}


}