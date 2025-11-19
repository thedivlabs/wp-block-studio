import MediaWatcher from './modules/MediaWatcher';

MediaWatcher.init();

document.fonts.load('24px "Material Symbols Outlined"').then(() => {
    
    console.log(document.querySelectorAll('.material-symbols-outlined'));

});
