import MediaWatcher from './modules/MediaWatcher';

if (document.body.classList.contains('block-editor-page') || !document.body.classList.contains('wp-admin')) {
    MediaWatcher.init();
}


document.fonts.load('24px "Material Symbols Outlined"').then(() => {

    document.body.classList.add('icons-loaded');
});
