<?php
/**
 * WPBS Video Element — matches JS block logic exactly
 */

if ( ! empty( $content ) ) {
    echo $content;

    return;
}

$settings = $attributes['wpbs-video'] ?? [];

// --------------------------------------------------
// Extract flat settings
// --------------------------------------------------
$link       = $settings['link'] ?? '';
$title      = $settings['title'] ?? '';
$desc       = $settings['description'] ?? '';
$resolution = $settings['resolution'] ?? 'medium';
$title_pos  = $settings['title-position'] ?? 'top';
$poster_id  = isset( $settings['poster'] ) ? intval( $settings['poster'] ) : null;

$lightbox = $settings['lightbox'] ?? true;
$overlay  = $settings['overlay'] ?? true;
$disabled = ! empty( $settings['disabled'] );
$eager    = ! empty( $settings['eager'] );

$icon = $settings['button-icon']['name'] ?? 'play_circle';


// --------------------------------------------------
// Extract YouTube ID
// --------------------------------------------------
$video_id = null;

if ( $link ) {
    $parsed = wp_parse_url( $link );

    if ( ! empty( $parsed['host'] ) && str_contains( $parsed['host'], 'youtu' ) ) {

        // 1. Try ?v=xxxx case like JS
        if ( ! empty( $parsed['query'] ) ) {
            parse_str( $parsed['query'], $q );
            if ( ! empty( $q['v'] ) ) {
                $video_id = $q['v'];
            }
        }

        // 2. Fallback to pathname (youtu.be / embed URLs)
        if ( ! $video_id && ! empty( $parsed['path'] ) ) {
            $video_id = ltrim( $parsed['path'], '/' );
        }
    }
}


// --------------------------------------------------
// Poster logic = EXACT mirror of JS getPosterSrc()
// --------------------------------------------------
$poster_src = '';

if ( $poster_id ) {
    $img = wp_get_attachment_image_src( $poster_id, $resolution );
    if ( ! empty( $img[0] ) ) {
        $poster_src = $img[0];
    }
} elseif ( $video_id ) {
    $poster_src = "https://i3.ytimg.com/vi/" . esc_attr( $video_id ) . "/hqdefault.jpg";
}


// --------------------------------------------------
// Classes (mirrors getClassNames() in JS)
// --------------------------------------------------
$classes = implode( ' ', array_filter( [
        'wpbs-video-element',
        'wpbs-video',
        'flex',
        'items-center',
        'justify-center',
        'relative',
        'w-full',
        'h-auto',
        'overflow-hidden',
        'cursor-pointer',
        'aspect-video',
        $lightbox ? '--lightbox' : null,
        $overlay ? '--overlay' : null,
        $disabled ? '--disabled' : null
] ) );

$wrapper_attrs = get_block_wrapper_attributes( [
        'class'         => $classes,
        'data-platform' => 'youtube',
        'data-vid'      => $video_id ?: '',
        'data-title'    => $title ?: '',
] );


// --------------------------------------------------
// Output
// --------------------------------------------------
?>
<div <?php echo $wrapper_attrs; ?>>

    <?php if ( $title ): ?>
        <div class="wpbs-video__title absolute z-20 left-0 w-full <?php echo $title_pos === 'bottom' ? 'bottom-0' : 'top-0'; ?>">
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
        <span class="material-symbols-outlined wpbs-icon" style="font-variation-settings:'FILL' 1,'wght' 300,'GRAD' 0,'opsz' 69;
             font-size:69px;
             font-weight:300;"><?php echo esc_html( $icon ); ?></span>
    </div>

    <?php if ( $poster_src ): ?>
        <img
                <?php echo $eager ? 'src="' . esc_url( $poster_src ) . '"' : 'data-src="' . esc_url( $poster_src ) . '"'; ?>
                alt="<?php echo esc_attr( $title ); ?>"
                class="w-full h-full absolute top-0 left-0 z-0 object-cover object-center"
        />
    <?php endif; ?>

</div>
