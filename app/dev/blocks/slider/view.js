import {store, getElement, getContext} from '@wordpress/interactivity';

const SWIPER_OPTIONS_VIEW = {
    on: {
        afterInit: (swiper) => {
            if (swiper.enabled === false) {
                swiper.el.classList.add('swiper--disabled');
            } else {
                swiper.el.classList.remove('swiper--disabled');
            }
            if (swiper.slides.length < 2) {
                swiper.disable();
            }
            if (swiper.autoplay.running) {
                swiper.autoplay.pause();
                setTimeout(() => {
                    swiper.autoplay.resume();
                }, 5000);
            }
        },
        paginationUpdate: (swiper, paginationEl) => {

            if (!!swiper?.['isBeginning']) {
                swiper.el.classList.add('swiper--start');
            } else {
                swiper.el.classList.remove('swiper--start');
            }
        },
        resize: (swiper) => {
            if (swiper.enabled === false) {
                swiper.el.classList.add('swiper--disabled');
            } else {
                swiper.el.classList.remove('swiper--disabled');
            }
        }
    }
};

function initLib() {
    if (typeof window.Swiper !== 'function') {

        let stylesheet = document.createElement('link');
        stylesheet.id = 'wpbs-swiper-styles';
        stylesheet.rel = 'stylesheet';
        stylesheet.type = 'text/css';
        stylesheet.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';

        document.head.appendChild(stylesheet);

        return new Promise((resolve, reject) => {
            const script_tag = document.createElement('script');
            script_tag.id = 'wpbs-swiper-js';
            script_tag.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
            script_tag.defer = true;
            script_tag.async = true;
            script_tag.onload = resolve;
            script_tag.onerror = reject;
            document.body.appendChild(script_tag);
        });

    } else {
        return Promise.resolve();
    }
}

const {state} = store('wpbs/slider', {
    callbacks: {
        observeSlider: () => {
            const {ref: element} = getElement();

            if (element.classList.contains('swiper-initialized')) {
                return;
            }


            let {args} = getContext();

            args = Object.assign({}, SWIPER_OPTIONS_VIEW, args);

            let observerIntersection = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {

                        observerIntersection.unobserve(entry.target);

                        if (entry.target.querySelectorAll(':scope > .swiper-wrapper > .wpbs-slide').length < 2) {
                            return false;
                        }

                        initLib().then(() => {

                            try {
                                new Swiper(entry.target, args);
                            } catch (e) {
                                console.error('Failed to initialize Swiper:', e);
                            }
                        })

                    }
                });

            }, {
                root: null,
                rootMargin: "90px",
                threshold: 0,
            });

            observerIntersection.observe(element);

        },
    }

});