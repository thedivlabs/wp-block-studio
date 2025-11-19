import MediaWatcher from './modules/MediaWatcher';

document.addEventListener("DOMContentLoaded", () => {
    if (!document.body.classList.contains('wp-admin')) {
        MediaWatcher.init();
    }

    document.fonts.load('24px "Material Symbols Outlined"').then(() => {
        document.body.classList.add('icons-loaded');
    });

    // PRELOAD FIRST — this needs max priority
    document.querySelectorAll('link[rel="preload"][data-href]').forEach(link => {
        const href = link.dataset.href;
        const mq = link.dataset.media;

        if (!mq || window.matchMedia(mq).matches) {
            link.href = href;
            link.removeAttribute('data-href');
        }
    });

    // NON-CRITICAL LINK HYDRATION — next animation frame
    requestAnimationFrame(() => {
        document.querySelectorAll('link[data-href]:not([rel="preload"])').forEach(link => {
            link.href = link.dataset.href;
        });
    });
});

