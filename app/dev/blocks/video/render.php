<?php
/**
 * Simplified WPBS Video Block PHP rendering
 */

// If editor content exists, output it and skip the rest
if ( ! empty( $content ) ) {
    echo $content;

    return;
}

// Block attributes
$settings = $attributes['wpbs-video'] ?? [];
$unique   = $attributes['uniqueId'] ?? '';
$link     = $settings['link'] ?? '';
$title    = $settings['title'] ?? '';
$desc     = $settings['description'] ?? '';
$res      = $settings['resolution'] ?? 'medium';
$overlay  = ! empty( $settings['overlay'] );
$lightbox = ! empty( $settings['options']['lightbox'] );
$icon     = $settings['button-icon'] ?? [];

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
if ( ! empty( $settings['poster']['id'] ) ) {
    // Use wp_get_attachment_image_src for the chosen resolution
    $attachment_id = intval( $settings['poster']['id'] );
    $poster_image  = wp_get_attachment_image_src( $attachment_id, $res );
    if ( ! empty( $poster_image[0] ) ) {
        $poster_src = $poster_image[0];
    }
} elseif ( $video_id ) {
    $poster_src = "https://i3.ytimg.com/vi/" . esc_attr( $video_id ) . "/hqdefault.jpg";
}

// Wrapper classes
$classes    = [
        'wpbs-video-element',
        $unique,
        'wpbs-video',
        $lightbox ? '--lightbox' : '',
        $overlay ? '--overlay' : '',
];
$classes    = array_filter( $classes );
$class_attr = implode( ' ', $classes );

// Wrapper attributes
$wrapper_attrs = get_block_wrapper_attributes( [
        'class'         => $class_attr,
        'data-platform' => 'youtube',
        'data-vid'      => $video_id ?: '',
        'data-title'    => $title ?: '',
] );

ob_start();
?>

    <div <?php echo $wrapper_attrs; ?>>

        <?php if ( $title ): ?>
            <div class="wpbs-video__title absolute z-20 left-0 w-full <?php echo ( $settings['title-position'] ?? '' ) === 'bottom' ? 'bottom-0' : 'top-0'; ?>">
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

<?php
echo ob_get_clean();
