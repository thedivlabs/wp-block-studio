import MediaWatcher from './modules/MediaWatcher';

window.MediaWatcher = MediaWatcher;

(function () {
    const MAX_WAIT = 20000;
    const INTERVAL = 100;
    const startTime = Date.now();
    

})();


document.addEventListener("DOMContentLoaded", () => {
    if (!document.body.classList.contains('wp-admin')) {
        window.MediaWatcher.init();
    }

    document.querySelectorAll('link[data-href]:not([rel="preload"])').forEach(link => {
        link.href = link.dataset.href;
        link.removeAttribute('data-href');
    });
});

