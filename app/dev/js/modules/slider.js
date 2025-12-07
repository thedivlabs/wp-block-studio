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

        // Ensure controller settings are included for slide-based control
        merged.controller = merge({}, merged.controller, {by: 'slide'});

        // --- NEW SLAVE CONTROL FIX ---
        // If the element is a slave, prevent any user interaction
        if (element.classList.contains('--slave')) {
            merged.allowTouchMove = false;
            merged.keyboard = false;
            // Also ensure navigation and pagination are explicitly off for the slave
            merged.navigation = false;
            merged.pagination = false;
        }
        // -----------------------------

        return merged;
    }

    static observe(element, args = {}) {
        if (element.classList.contains('swiper-initialized')) return;

        // Use a clone to avoid modifying the original mergeArgs result for the master
        const mergedArgs = this.mergeArgs(element, args);
        const controllerId = element.getAttribute('data-slider-controller');
        const isMaster = element.classList.contains('--master');
        const isSlave = element.classList.contains('--slave');

        const initFn = () => {
            // New Swiper instance
            const swiperInstance = new Swiper(element, mergedArgs);
            element.swiper = swiperInstance;

            // Master linking
            if (isMaster && controllerId) {
                const slaveEls = document.querySelectorAll(
                    `.wpbs-slider.swiper[data-slider-controller="${controllerId}"].--slave`
                );
                const slaveInstances = [];

                slaveEls.forEach(slaveEl => {
                    if (!slaveEl.classList.contains('swiper-initialized')) {
                        // slaveArgs now includes allowTouchMove: false, keyboard: false
                        const slaveArgs = this.mergeArgs(slaveEl, {});
                        const slaveSwiper = new Swiper(slaveEl, slaveArgs);
                        slaveEl.swiper = slaveSwiper;
                        slaveInstances.push(slaveSwiper);
                    } else {
                        slaveInstances.push(slaveEl.swiper);
                    }
                });

                // Link master → slaves (Master controls Slaves)
                if (slaveInstances.length) {
                    swiperInstance.controller.control = slaveInstances;
                }

      
            }

            // Slave linking if initialized first
            if (isSlave && controllerId) {
                const masterEl = document.querySelector(`.wpbs-slider.swiper[data-slider-controller="${controllerId}"].--master`);
                if (masterEl && masterEl.swiper) {
                    // Link slave → master (Slave instance is controlled by Master instance)
                    swiperInstance.controller.control = masterEl.swiper;
                } else if (masterEl) {
                    requestAnimationFrame(initFn);
                    return;
                }
            }
        };

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

    // ... initLib remains unchanged
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