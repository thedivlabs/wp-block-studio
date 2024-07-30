document.addEventListener('DOMContentLoaded', () => {

    const responsiveVideos = [...document.querySelectorAll('video source')];

    let resizeObserver = new ResizeObserver(() => {

        responsiveVideos.forEach((source)=>{

            const mq = source.dataset.media;

            if(!mq){
                source.removeAttribute('src');
                return false;
            }

            if(window.matchMedia(mq).matches){
                source.src = source.dataset.src;
                source.closest('video').load();
            } else {
                source.removeAttribute('src');
            }

        });
        responsiveVideos.forEach((source)=>{
            source.closest('video').play();
        });
    });

    // Add a listener to body
    resizeObserver.observe(document.getElementsByTagName('body')[0]);

});

