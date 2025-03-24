import Modals from 'Modules/modals'
import Loader from 'Modules/loader'



class WPBS{

    static modals;
    static loader;

    constructor(){
        this.modals = Modals;
        this.loader = Loader;

        this.modals.init();
        this.loader.init();

        init();
    }

    static init(){
        document.addEventListener('DOMContentLoaded', () => {

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
                        }

                    }
                });

            }, {
                root: null,
                rootMargin: "90px",
                threshold: 0,
            });

            [...document.querySelectorAll('video:has(source[data-media]):has(source[data-src]),.wpbs-background.lazy')].forEach((media) => {
                observerIntersection.observe(media);
            });

        });
    }
}

new WPBS();



