import ResponsiveMedia from './util/ResponsiveMedia';

document.addEventListener('DOMContentLoaded', () => {

    //ResponsiveMedia({ref: false});

    function responsiveVideoSrc(video) {
        [...video.querySelectorAll('source')].forEach((source) => {
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
    }

    function responsiveImageSrc(image) {
        if(image.dataset.src){
            image.src = image.dataset.src;
            image.removeAttribute('data-src');
        }
        if(image.dataset.srcset){
            image.srcset = image.dataset.srcset;
            image.removeAttribute('data-srcset');
        }
    }

    function responsiveBackgroundSrc(element) {

        element.classList.remove('lazy');
    }

    let timer;

    let observerSize = new ResizeObserver((entries) => {

        clearTimeout(timer);
        timer = setTimeout(() => {
            entries.forEach((entry) => {
                responsiveVideoSrc(entry.target);
            });
        }, 500);


    });

    let observerIntersection = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {

                if (entry.target.tagName === 'VIDEO') {
                    responsiveVideoSrc(entry.target);
                    observerSize.observe(entry.target);
                    observerIntersection.unobserve(entry.target);
                } else if (entry.target.classList.contains('wpbs-background')) {
                    responsiveBackgroundSrc(entry.target);
                    observerIntersection.unobserve(entry.target);
                } else {
                    responsiveImageSrc(entry.target);
                    observerIntersection.unobserve(entry.target);
                }

            }
        });

    }, {
        root: null,
        rootMargin: "90px",
        threshold: 0,
    });

    [...document.querySelectorAll('[data-src],[data-srcset],video:has(source[data-media]):has(source[data-src]),.wpbs-background.lazy')].forEach((media) => {
        observerIntersection.observe(media);
    });

});

