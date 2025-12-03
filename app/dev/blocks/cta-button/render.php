<?php


if ( empty( $block ) || empty( $content ) ) {
	return false;
}

// Anonymous class stays local to THIS file only.
$CTA = new class {

	public function url( array $settings, WP_Block $block ): string {

		// Loop OFF → normal URL.
		if ( empty( $settings['loop'] ) ) {
			return $settings['link']['url'] ?? '#';
		}

		// Loop ON → pull loop item from context.
		$item = $block->context['wpbs/loopItem'] ?? null;
		if ( ! $item ) {
			return $settings['link']['url'] ?? '#';
		}

		// Term loop
		if ( $item instanceof WP_Term ) {
			$url = get_term_link( $item );

			return is_wp_error( $url ) ? '#' : $url;
		}

		// Post loop
		if ( $item instanceof WP_Post ) {
			return get_permalink( $item );
		}

		// Unknown — fallback
		return $settings['link']['url'] ?? '#';
	}
};

$final_url = $CTA->url( $attributes['wpbs-cta'] ?? [], $block );

$content = str_replace( '%%URL%%', esc_url( $final_url ), $content );

echo $content;
