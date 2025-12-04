import MediaWatcher from './modules/MediaWatcher';

(function () {
    const MAX_WAIT = 5000;
    const INTERVAL = 100;
    const startTime = Date.now();

    function watchIconsFont() {

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

    const settings = window.WPBS?.settings || {};
    const bp = settings.breakpoints || {};
    const preloads = settings.preload_media || [];

    preloads.forEach(item => {
        if (!item.type || !item.id || !item.url) return; // skip invalid entries

        // Build URL to media
        const url = `${item.url}.${item.type === 'image' && 'webp'}`;

        // Create link element
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = item.type;
        link.classList.add('wpbs-preload');

        // Optional breakpoint handling
        if (item.breakpoint && bp[item.breakpoint] && bp[item.breakpoint].size) {
            const mq = `(max-width:${bp[item.breakpoint].size}px)`;
            if (!window.matchMedia(mq).matches) {
                return; // skip this element if media query doesn't match
            }
        }

        link.href = url;

        document.head.appendChild(link);
    });

})();


document.addEventListener("DOMContentLoaded", () => {
    if (!document.body.classList.contains('wp-admin')) {
        MediaWatcher.init();

        // NON-CRITICAL LINK HYDRATION — next animation frame
        requestAnimationFrame(() => {
            document.querySelectorAll('link[data-href]:not([rel="preload"])').forEach(link => {
                link.href = link.dataset.href;
            });
        });
    }
});

