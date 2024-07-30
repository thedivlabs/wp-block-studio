document.addEventListener('DOMContentLoaded', () => {

    const responsiveVideos = [...document.querySelectorAll('video source[data-src]')];

    let resizeObserver = new ResizeObserver(() => {

        responsiveVideos.forEach((source)=>{

            const mq = source.dataset.media;

            if(!mq){
                return false;
            }

            if(window.matchMedia(mq).matches){
                source.src = source.dataset.src;
                source.closest('video').load();
            } else {
                source.removeAttribute('src');
            }

        });

    });

    // Add a listener to body
    resizeObserver.observe(document.getElementsByTagName('body')[0]);

});

