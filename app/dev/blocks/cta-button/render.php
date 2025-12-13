<?php

if ( empty( $block ) || empty( $content ) ) {
	return false;
}

$settings = $attributes['wpbs-cta'] ?? [];

/**
 * Anonymous CTA helper
 */
$CTA = new class {

	public function url( array $settings, WP_Block $block ): string {

		// Normal mode (not loop)
		if ( empty( $settings['loop'] ) ) {
			if ( ! empty( $settings['link']['url'] ) && is_string( $settings['link']['url'] ) ) {
				return $settings['link']['url'];
			} else {
				return '#';
			}

		}

		// Loop mode — check postId first
		$post_id = $block->context['postId'] ?? null;
		if ( $post_id ) {
			$permalink = get_permalink( (int) $post_id );

			return $permalink ?: '#';
		}

		// Term loop
		$term_id = $block->context['termId'] ?? null;
		if ( $term_id ) {
			$url = get_term_link( (int) $term_id );

			return is_wp_error( $url ) ? '#' : $url;
		}

		// Fallback
		return $settings['link']['url'] ?? '#';
	}
};

$final_url = $CTA->url( $settings, $block );

// Inject
$content = str_replace( '%%URL%%', esc_url( $final_url ), $content );

echo $content;
