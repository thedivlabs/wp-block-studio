document.addEventListener('DOMContentLoaded', () => {

    const responsiveVideos = [...document.querySelectorAll('video:has(source[data-media])')];

    let resizeObserver = new ResizeObserver(() => {

        responsiveVideos.forEach((video) => {
            video.autoplay = true;
            [...video.querySelectorAll('source')].forEach((source)=>{
                const mq = source.dataset.media;

                if (!mq) {
                    source.remove();
                    return false;
                }

                if (window.matchMedia(mq).matches) {
                    source.src = source.dataset.src;
                } else {
                    source.src = '#';
                }
            })
            video.load();
        });

    });

    // Add a listener to body
    resizeObserver.observe(document.getElementsByTagName('body')[0]);

});

