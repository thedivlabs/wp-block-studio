import MediaWatcher from './modules/MediaWatcher';

document.addEventListener("DOMContentLoaded", () => {
    if (!document.body.classList.contains('wp-admin')) {
        MediaWatcher.init();
    }

    document.fonts.load('24px "Material Symbols Outlined"').then(() => {
        document.body.classList.add('icons-loaded');
    });

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

        // hydrate preload
        if (chosen) {
            link.href = chosen;
        }
    });


    // NON-CRITICAL LINK HYDRATION — next animation frame
    requestAnimationFrame(() => {
        document.querySelectorAll('link[data-href]:not([rel="preload"])').forEach(link => {
            link.href = link.dataset.href;
        });
    });
});

