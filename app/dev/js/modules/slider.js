import {SWIPER_ARGS_VIEW} from 'Includes/config';
import merge from 'lodash/merge';

export default class Slider {

    static init() {
        /* [...document.querySelectorAll('.wpbs-slider.swiper')].forEach(el => {
            this.observe(el);
        }); */
    }

    static observe(element, args = {}) {
        if (element.classList.contains('swiper-initialized')) return;

        const mergedArgs = this.mergeArgs(element, args);

        console.log(mergedArgs);

        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                observerInstance.unobserve(element);

                const slides = entry.target.querySelectorAll(':scope > .swiper-wrapper > .swiper-slide');
                if (slides.length <= 1) return;

                this.initLib().then(() => {
                    try {
                        new Swiper(entry.target, mergedArgs);
                    } catch (e) {
                        console.error('Failed to initialize Swiper:', e);
                    }
                });
            });
        }, {
            root: null,
            rootMargin: '90px',
            threshold: 0,
        });

        observer.observe(element);
    }

    static mergeArgs(element, args = {}) {
        // Clone default to avoid mutation
        const merged = merge({}, SWIPER_ARGS_VIEW);

        // Navigation always points to correct DOM elements
        merged.navigation = {
            ...merged.navigation,
            nextEl: element.querySelector('.wpbs-slider-button--next'),
            prevEl: element.querySelector('.wpbs-slider-button--prev'),
            ...args.navigation, // allow overrides
        };

        // Pagination: merge only if object, else keep default
        if (args.pagination && typeof args.pagination === 'object') {
            merged.pagination = merge({}, merged.pagination, args.pagination);
        }

        // Merge any other top-level args
        Object.keys(args).forEach(key => {
            if (key !== 'navigation' && key !== 'pagination') {
                merged[key] = args[key];
            }
        });

        return merged;
    }

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
