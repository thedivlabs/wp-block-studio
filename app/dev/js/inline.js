import MediaWatcher from './modules/MediaWatcher';

(function () {
    const MAX_WAIT = 5000;  // maximum time to wait for the font
    const INTERVAL = 50;    // check every 50ms

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

    // PRELOAD FIRST — this needs max priority
    const bp = window.WPBS?.settings?.breakpoints || {};

    document.querySelectorAll('link[rel="preload"][data-group]').forEach(link => {

        let chosen = link.dataset.default || null;

        for (const attr of link.attributes) {
            const name = attr.name;

            if (!name.startsWith('data-') || name === 'data-default' || name === 'data-group')
                continue;

            const bpKey = name.replace('data-', '');
            const config = bp[bpKey];

            if (!config || !config.size) continue;

            const max = config.size;
            if (window.matchMedia(`(max-width:${max}px)`).matches) {
                chosen = attr.value;
                break;
            }
        }

        // hydrate preload safely
        if (chosen && chosen !== "#" && chosen.trim() !== "") {
            link.href = chosen;
            link.rel = 'preload';
        } else {
            // Prevent Chrome warnings and invalid preloads
            link.rel = '';
            link.href = '';
        }

    });


    // NON-CRITICAL LINK HYDRATION — next animation frame
    requestAnimationFrame(() => {
        document.querySelectorAll('link[data-href]:not([rel="preload"])').forEach(link => {
            link.href = link.dataset.href;
        });
    });
});

