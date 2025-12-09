<?php
/**
 * Loop Card Block render.php
 */

// Replace term and post placeholders if present
if ( ! empty( $block->context['wpbs/termId'] ) ) {
	$term_link = get_term_link( $block->context['wpbs/termId'] );
	$content   = str_replace( '%%__TERM_LINK_URL__%%', $term_link, $content ?? '' );
}

if ( ! empty( $block->context['wpbs/postId'] ) ) {
	$content = str_replace( '%%__POST_LINK_URL__%%', get_permalink(), $content ?? '' );
}

// If content exists from InnerBlocks, output it and skip PHP rendering
if ( ! empty( $content ) ) {
	echo $content;

	return;
}

// Media object from context
$media = $block->context['wpbs/media'] ?? null;

// Fallback if no media
if ( ! $media ) {
	return;
}

// Common variables
$uniqueId   = $block->attributes['uniqueId'] ?? '';
$classes    = [
	'wpbs-loop-card',
	'grid-card',
	'w-full',
	'block',
	'relative',
	$uniqueId,
];
$class_attr = implode( ' ', array_filter( $classes ) );

// Wrapper attributes
$wrapper_attrs = get_block_wrapper_attributes( [
	'class' => $class_attr,
] );

// Output buffer
ob_start();
?>

    <div <?php echo $wrapper_attrs; ?>>

		<?php if ( ! empty( $media['type'] ) && $media['type'] === 'video' ) :
			$link = $media['link'] ?? '';
			$title = $media['title'] ?? '';
			$desc = $media['description'] ?? '';
			$res = $media['resolution'] ?? 'medium';
			$overlay = ! empty( $media['overlay'] );
			$lightbox = ! empty( $media['options']['lightbox'] );
			$icon = $media['button-icon'] ?? 'play_circle';

			// Extract YouTube video ID
			$video_id = null;
			if ( ! empty( $link ) ) {
				$parsed = wp_parse_url( $link );
				if ( ! empty( $parsed['host'] ) && str_contains( $parsed['host'], 'youtu' ) ) {
					if ( ! empty( $parsed['query'] ) ) {
						parse_str( $parsed['query'], $q );
						$video_id = $q['v'] ?? null;
					} elseif ( ! empty( $parsed['path'] ) ) {
						$video_id = ltrim( $parsed['path'], '/' );
					}
				}
			}

			// Poster fallback
			$poster_src = '';
			if ( ! empty( $media['poster']['id'] ) ) {
				$attachment_id = intval( $media['poster']['id'] );
				$poster_image  = wp_get_attachment_image_src( $attachment_id, $res );
				if ( ! empty( $poster_image[0] ) ) {
					$poster_src = $poster_image[0];
				}
			} elseif ( $video_id ) {
				$poster_src = "https://i3.ytimg.com/vi/" . esc_attr( $video_id ) . "/hqdefault.jpg";
			}
			?>
            <!-- Video Output -->
			<?php $video_classes = array_filter( [
			'wpbs-video-element',
			$uniqueId,
			'wpbs-video',
			$lightbox ? '--lightbox' : '',
			$overlay ? '--overlay' : ''
		] ); ?>
            <div class="<?php echo esc_attr( implode( ' ', $video_classes ) ); ?>" data-platform="youtube"
                 data-vid="<?php echo esc_attr( $video_id ); ?>" data-title="<?php echo esc_attr( $title ); ?>">

				<?php if ( $title ): ?>
                    <div class="wpbs-video__title absolute z-20 left-0 w-full <?php echo ( $media['title-position'] ?? '' ) === 'bottom' ? 'bottom-0' : 'top-0'; ?>">
                        <span><?php echo esc_html( $title ); ?></span>
                    </div>
				<?php endif; ?>

				<?php if ( $desc ): ?>
                    <div class="wpbs-video__description absolute z-20 left-0 w-full bottom-0">
                        <span><?php echo esc_html( $desc ); ?></span>
                    </div>
				<?php endif; ?>

                <div class="wpbs-video__button pointer-events-none flex justify-center items-center absolute top-1/2 left-1/2 aspect-square z-20 transition-colors duration-300 leading-none">
                    <span class="screen-reader-text">Play video</span>
					<?php if ( ! empty( $icon['name'] ) ) : ?>
                        <i class="material-icons"><?php echo esc_html( $icon['name'] ); ?></i>
					<?php endif; ?>
                </div>

				<?php if ( $poster_src ): ?>
                    <img
                            src="<?php echo esc_url( $poster_src ); ?>"
                            alt="<?php echo esc_attr( $title ); ?>"
                            class="w-full h-full absolute top-0 left-0 z-0 object-cover object-center"
                    />
				<?php endif; ?>
            </div>

		<?php elseif ( ! empty( $media['type'] ) && $media['type'] === 'image' ) :
			// Image output
			$attachment_id = intval( $media['id'] ?? 0 );
			if ( $attachment_id ) :
				$res = $media['resolution'] ?? 'medium';
				echo wp_get_attachment_image( $attachment_id, $res, false, [ 'class' => 'w-full h-full object-cover' ] );
			endif;
		endif; ?>

    </div>

<?php
echo ob_get_clean();
