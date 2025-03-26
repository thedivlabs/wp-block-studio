import Modals from './modules/modals'
import Loader from './modules/loader'
import {swiperDefaultArgs} from "./inc/helper";


class WPBS_Theme {

    static modals;
    static loader;
    static swiper;

    constructor() {

        this.modals = Modals;
        this.loader = Loader;
        this.swiper = {
            args: {
                ...swiperDefaultArgs
            }
        };

        this.modals.init();
        this.loader.init();

        this.init();
    }

    observeMedia(refElement) {
        if (!refElement) {
            return false;
        }

        let observerIntersection = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {

                    const media = entry.target;
                    observerIntersection.unobserve(entry.target);

                    if (media.dataset.src) {
                        media.src = media.dataset.src;
                        media.removeAttribute('data-src');
                    }

                    if (media.dataset.srcset) {
                        media.srcset = media.dataset.srcset;
                        media.removeAttribute('data-srcset');
                    }

                }
            });

        }, {
            root: null,
            rootMargin: "90px",
            threshold: 0,
        });

        [...refElement.querySelectorAll('[data-src],[data-srcset]')].forEach((media) => {
            observerIntersection.observe(media);
        });
    }


    init() {
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

window.WPBS = new WPBS_Theme();



