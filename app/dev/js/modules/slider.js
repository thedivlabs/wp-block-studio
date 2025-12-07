import {SWIPER_ARGS_VIEW} from 'Includes/config';
import merge from 'lodash/merge';

export default class Slider {

    static init() {
    }

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

    static observe(element, args = {}) {
        if (element.classList.contains('swiper-initialized')) return;

        const mergedArgs = this.mergeArgs(element, args);
        const controllerId = element.getAttribute('data-slider-controller');
        const isMaster = element.classList.contains('--master');
        const isSlave = element.classList.contains('--slave');

        const initFn = () => {
            const swiperInstance = new Swiper(element, mergedArgs);
            element.swiper = swiperInstance;

            if (controllerId) {
                // Master → Slaves
                if (isMaster) {
                    const slaves = Array.from(
                        document.querySelectorAll(`.wpbs-slider.swiper[data-slider-controller="${controllerId}"].--slave`)
                    ).filter(slave => !slave.classList.contains('swiper-initialized'));

                    const slaveInstances = slaves.map(slaveEl => {
                        const slaveArgs = this.mergeArgs(slaveEl);
                        const slaveSwiper = new Swiper(slaveEl, slaveArgs);
                        slaveEl.swiper = slaveSwiper;
                        return slaveSwiper;
                    });

                    // Link master ↔ slaves
                    if (slaveInstances.length) {
                        swiperInstance.controller.control = slaveInstances;
                        swiperInstance.controller.by = 'slide';
                        slaveInstances.forEach(slave => {
                            slave.controller.control = swiperInstance;
                            slave.controller.by = 'slide';
                        });
                    }
                }

                // Slave → Master (if initialized first)
                if (isSlave) {
                    const masterEl = document.querySelector(`.wpbs-slider.swiper[data-slider-controller="${controllerId}"].--master`);
                    if (masterEl?.swiper) {
                        swiperInstance.controller.control = masterEl.swiper;
                        swiperInstance.controller.by = 'slide';
                    } else if (masterEl) {
                        requestAnimationFrame(initFn); // retry until master is ready
                        return;
                    }
                }
            }
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                obs.unobserve(element);

                const slides = element.querySelectorAll(':scope > .swiper-wrapper > .swiper-slide');
                if (slides.length <= 1) return;

                this.initLib().then(initFn).catch(console.error);
            });
        }, {root: null, rootMargin: '90px', threshold: 0});

        observer.observe(element);
    }

    static initLib() {
        if (!this._libPromise) {
            if (typeof window.Swiper === 'function') {
                this._libPromise = Promise.resolve();
            } else {
                const link = document.createElement('link');
                link.id = 'wpbs-swiper-styles';
                link.rel = 'stylesheet';
                link.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
                document.head.appendChild(link);

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
