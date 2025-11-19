import MediaWatcher from './modules/MediaWatcher';

if (!document.body.classList.contains('wp-admin')) {
    MediaWatcher.init();
}

document.fonts.load('24px "Material Symbols Outlined"').then(() => {
    document.body.classList.add('icons-loaded');
});

requestAnimationFrame(() => {
    document.querySelectorAll('link[data-href]').forEach((link) => {
        link.href = link.dataset.href;
    });
});

