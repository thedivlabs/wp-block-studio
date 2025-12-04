import MediaWatcher from './modules/MediaWatcher';

(function () {
    const MAX_WAIT = 5000;
    const INTERVAL = 100;

    function watchIconsFont(startTime = Date.now()) {
        document.fonts.load('24px "Material Symbols Outlined"').then((fonts) => {
            if (fonts.length > 0) {
                document.body.classList.add('icons-loaded');
            } else if (Date.now() - startTime < MAX_WAIT) {
                setTimeout(() => watchIconsFont(startTime), INTERVAL);
            }
        });
    }

    // start watching
    watchIconsFont();
})();


document.addEventListener("DOMContentLoaded", () => {
    if (!document.body.classList.contains('wp-admin')) {
        MediaWatcher.init();
    }

    const bp = window.WPBS?.settings?.breakpoints || {};

    document.querySelectorAll('link[rel="preload"][data-href]').forEach(link => {

        const src = link.dataset.href;
        const mediaKey = link.dataset.media; // optional

        // Case: no media conditions — always keep
        if (!mediaKey) {
            link.href = src;
            return;
        }

        // Has media condition → check breakpoint
        const config = bp[mediaKey];

        // Invalid or missing breakpoint → remove
        if (!config || !config.size) {
            link.remove();
            return;
        }

        const mq = `(max-width:${config.size}px)`;

        // If media matches → keep and apply href
        if (window.matchMedia(mq).matches) {
            link.href = src;
            return;
        }

        // Media does not match → remove element
        link.remove();
    });


    // NON-CRITICAL LINK HYDRATION — next animation frame
    requestAnimationFrame(() => {
        document.querySelectorAll('link[data-href]:not([rel="preload"])').forEach(link => {
            link.href = link.dataset.href;
        });
    });
});

