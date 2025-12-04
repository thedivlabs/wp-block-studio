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
    //watchIconsFont();


})();


document.addEventListener("DOMContentLoaded", () => {
    if (!document.body.classList.contains('wp-admin')) {
        MediaWatcher.init();
    }

    // NON-CRITICAL LINK HYDRATION — next animation frame
    requestAnimationFrame(() => {
        document.querySelectorAll('link[data-href]:not([rel="preload"])').forEach(link => {
            link.href = link.dataset.href;
            link.removeAttribute('data-href');
        });
    });
});

