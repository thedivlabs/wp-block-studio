import {SWIPER_ARGS_VIEW, SWIPER_ARGS_DEFAULT} from 'Includes/config';
import merge from 'lodash.merge';


export default class Slider {

    static init() {


    }


    static observe(element, args = {}) {

        if (element.classList.contains('swiper-initialized')) {
            return;
        }

        const {on, ...safeArgs} = args || {};

        args = merge({}, SWIPER_ARGS_VIEW, safeArgs, {
            navigation: {
                enabled: true,
                nextEl: element.querySelector('.wpbs-slider-btn--next'),
                prevEl: element.querySelector('.wpbs-slider-btn--prev'),
            },
        });

        let observerIntersection = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {

                    observerIntersection.unobserve(entry.target);

                    if (entry.target.querySelectorAll(':scope > .swiper-wrapper > .swiper-slide').length <= 1) {
                        return false;
                    }

                    this.initLib().then(() => {

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
    }

    static async initLib() {
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


}