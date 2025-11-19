import MediaWatcher from './modules/MediaWatcher';


MediaWatcher.init();


document.fonts.load('24px "Material Symbols Outlined"').then(() => {

    document.body.classList.add('icons-loaded');
});
