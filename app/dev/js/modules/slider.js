import {SWIPER_ARGS_VIEW} from 'Includes/config';
import merge from 'lodash/merge';

export default class Slider {

    static init() {
        // intentionally empty
    }

    /**
     * Deep merge args, merging objects into defaults
     */
    static mergeArgs(element, args = {}) {
        const merged = merge({}, SWIPER_ARGS_VIEW);

        merged.navigation = {
            ...merged.navigation,
            nextEl: element.querySelector('.wpbs-slider-button--next'),
            prevEl: element.querySelector('.wpbs-slider-button--prev'),
            ...args.navigation,
        };

        if (args.pagination && typeof args.pagination === 'object') {
            merged.pagination = merge({}, merged.pagination, args.pagination);
        }

        Object.keys(args).forEach(key => {
            if (key !== 'navigation' && key !== 'pagination') {
                merged[key] = args[key];
            }
        });

        return merged;
    }

    /**
     * Observe and initialize any slider (standalone, master, or slave)
     */
    static observe(element, args = {}) {
        if (element.classList.contains('swiper-initialized')) return;

        const mergedArgs = this.mergeArgs(element, args);
        const controllerId = element.getAttribute('data-slider-controller');
        const isMaster = element.classList.contains('--master');
        const isSlave = element.classList.contains('--slave');

        const initFn = () => {
            const swiperInstance = new Swiper(element, mergedArgs);
            element.swiper = swiperInstance;

            // Master logic: link all slaves
            if (isMaster && controllerId) {
                const slaves = document.querySelectorAll(
                    `.wpbs-slider.swiper[data-slider-controller="${controllerId}"].--slave`
                );

                slaves.forEach(slaveEl => {
                    if (!slaveEl.classList.contains('swiper-initialized')) {
                        const slaveArgs = this.mergeArgs(slaveEl, {});
                        // Important: move slave slide-by-slide
                        slaveArgs.controller = {control: swiperInstance, controlBy: 'slide'};
                        const slaveSwiper = new Swiper(slaveEl, slaveArgs);
                        slaveEl.swiper = slaveSwiper;
                    } else {
                        slaveEl.swiper.controller.control = swiperInstance;
                        // force slide-by-slide control
                        slaveEl.swiper.controller.controlBy = 'slide';
                    }
                });
            }

            // Slave logic: wait for master
            if (isSlave && controllerId) {
                const masterEl = document.querySelector(`.wpbs-slider.swiper[data-slider-controller="${controllerId}"].--master`);
                if (masterEl && masterEl.swiper) {
                    swiperInstance.controller.control = masterEl.swiper;
                    swiperInstance.controller.controlBy = 'slide';
                } else if (masterEl) {
                    requestAnimationFrame(initFn);
                    return;
                }
            }
        };

        // Lazy-init with IntersectionObserver
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                observerInstance.unobserve(element);

                const slides = element.querySelectorAll(':scope > .swiper-wrapper > .swiper-slide');
                if (slides.length <= 1) return;

                this.initLib().then(initFn).catch(console.error);
            });
        }, {
            root: null,
            rootMargin: '90px',
            threshold: 0,
        });

        observer.observe(element);
    }

    /**
     * Lazy-load Swiper JS/CSS from CDN
     */
    static initLib() {
        if (!this._libPromise) {
            if (typeof window.Swiper === 'function') {
                this._libPromise = Promise.resolve();
            } else {
                const stylesheet = document.createElement('link');
                stylesheet.id = 'wpbs-swiper-styles';
                stylesheet.rel = 'stylesheet';
                stylesheet.type = 'text/css';
                stylesheet.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
                document.head.appendChild(stylesheet);

                this._libPromise = new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.id = 'wpbs-swiper-js';
                    script.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
                    script.defer = true;
                    script.async = true;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });
            }
        }

        return this._libPromise;
    }
}
