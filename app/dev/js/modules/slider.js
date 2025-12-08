// slider class

import {SWIPER_ARGS_VIEW} from 'Includes/config';
import merge from 'lodash/merge';

export default class Slider {

    // --- Constants ---
    // These constants are no longer needed as normalization is done in the block.
    // static SPECIAL_PROP_MAP = {enabled: val => !val};
    // static propsToSuppress = ['enabled'];
    static _libPromise = null;

    /**
     * Initializes all Swiper instances on the page.
     */
    static init() {
        const allSliderElements = Array.from(document.querySelectorAll('.wpbs-slider.swiper'));

        const slaves = allSliderElements.filter(el => el.classList.contains('--slave'));
        const masters = allSliderElements.filter(el => el.classList.contains('--master'));
        const others = allSliderElements.filter(el => !el.classList.contains('--slave') && !el.classList.contains('--master'));

        // Process in the order: Slaves, then Others, then Masters (who handle linking)
        [...slaves, ...others, ...masters].forEach(element => {
            // The context is now the fully normalized Swiper args object
            const swiperArgs = this.getRawContext(element);
            this.observe(element, swiperArgs);
        });
    }

    // --- Data Retrieval ---

    static getRawContext(element) {
        const configAttr = element.dataset?.context;
        if (configAttr) {
            try {
                // Returns the fully normalized Swiper args object
                return JSON.parse(configAttr);
            } catch (e) {
                console.error('Error parsing Swiper config JSON from data-context:', e);
            }
        }
        // Return an empty object ready for merging
        return {};
    }

    // ❌ DELETE normalizeProp
    // ❌ DELETE normalizeAndGetSwiperArgs

    // --- Original Methods (Used to merge and initialize) ---

    static mergeArgs(element, args = {}) {
        const merged = merge({}, SWIPER_ARGS_VIEW);
        const isMaster = element.classList.contains('--master');
        const isSlave = element.classList.contains('--slave');

        // NAVIGATION: Merge in args.navigation (if present), and add DOM element selectors.
        merged.navigation = merge({}, merged.navigation, args.navigation, {
            nextEl: element.querySelector('.wpbs-slider-button--next'),
            prevEl: element.querySelector('.wpbs-slider-button--prev'),
        });

        // PAGINATION FIX: Pagination object is already fully compliant in args.
        // We only merge if the args contains a pagination object. This fixes the issue
        // of `merge` iterating over string characters if `args.pagination` was a string.
        if (typeof args.pagination === 'object' && args.pagination !== null) {
            merged.pagination = merge({}, merged.pagination, args.pagination);
        } else if (args.pagination === false) {
            // Explicitly handle disabling pagination
            merged.pagination = false;
        }


        // Apply all normalized props from the block context (excluding navigation/pagination)
        Object.keys(args).forEach(key => {
            if (key !== 'navigation' && key !== 'pagination') {
                merged[key] = args[key];
            }
        });

        // CONTROLLER FIX: Master uses 'container'
        const controllerId = element.getAttribute('data-slider-controller');

        // Use the controller ID from the block's data attribute if it exists, otherwise fall back to 'slide'
        const controllerBy = controllerId ? (isMaster ? 'container' : 'slide') : (args.controller?.by || 'slide');

        // Note: args.controller is *not* present in the normalized object, as it's extracted
        // to data-slider-controller. Re-adding minimal controller config here.
        merged.controller = merge({}, merged.controller, {
            by: controllerBy
        });

        // SLAVE CONTROL FIX (LOCKOUT)
        if (isSlave) {
            merged.touchRatio = 0;
            merged.navigation = false;
            merged.pagination = false;
            // Clean up potentially conflicting base properties
            delete merged.allowTouchMove;
            delete merged.keyboard;
        }

        return merged;
    }

    // --- New Refactored Linking Method ---
    static linkMasterGroup(masterElement, masterInstance, controllerId) {
        // ... (function logic remains the same) ...
        const allLinkedElements = document.querySelectorAll(
            `.wpbs-slider.swiper[data-slider-controller="${controllerId}"]`
        );

        const allLinkedInstances = [];

        allLinkedElements.forEach(linkedEl => {
            let instance;
            if (!linkedEl.classList.contains('swiper-initialized')) {
                // Initialize any uninitialized linked element (Slaves)
                const linkedArgs = this.mergeArgs(linkedEl, this.getRawContext(linkedEl)); // Use getRawContext here
                instance = new Swiper(linkedEl, linkedArgs);
                linkedEl.swiper = instance;
                instance.update();
            } else {
                // Element was already initialized (Master itself or a pre-initialized Slave)
                instance = linkedEl.swiper;
            }

            if (instance) {
                allLinkedInstances.push(instance);
            }
        });

        // BIDIRECTIONAL CONTROL FIX
        if (allLinkedInstances.length > 1) {
            allLinkedInstances.forEach(currentInstance => {
                currentInstance.controller.control = allLinkedInstances.filter(
                    targetInstance => targetInstance !== currentInstance
                );
                currentInstance.update();
            });
        }
    }


    /**
     * Uses Observer for Masters/Others, immediate initialization for Slaves.
     */
    static observe(element, args = {}) {
        if (element.classList.contains('swiper-initialized')) return;

        // Simplify merging/filtering: mergeArgs handles complexity, use Object.assign to filter null/undefined/empty string
        const mergedArgs = Object.fromEntries(
            Object.entries(this.mergeArgs(element, args)).filter(
                ([, value]) => value !== undefined && value !== null && value !== ""
            )
        );

        const controllerId = element.getAttribute('data-slider-controller');
        const isMaster = element.classList.contains('--master');
        const isSlave = element.classList.contains('--slave');

        if (element.querySelectorAll(':scope > .swiper-wrapper > .swiper-slide').length <= 1) return;
        
        const initFn = () => {
            const swiperInstance = new Swiper(element, mergedArgs);
            element.swiper = swiperInstance;
            swiperInstance.update();

            // Refactored Master linking
            if (isMaster && controllerId) {
                this.linkMasterGroup(element, swiperInstance, controllerId);
            }
        };

        // 🟢 CONDITIONAL LOADING LOGIC 🟢

        if (isSlave) {
            // SLAVES: Immediate load to be ready for the Master's linking logic.
            this.initLib().then(initFn).catch(console.error);
        } else {
            // MASTERS / OTHERS: Lazy load via Intersection Observer.
            const observer = new IntersectionObserver((entries, observerInstance) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    observerInstance.unobserve(element);
                    this.initLib().then(initFn).catch(console.error);
                });
            }, {
                root: null,
                rootMargin: '90px',
                threshold: 0,
            });
            observer.observe(element);
        }
    }

    // Static property _libPromise is initialized above.
    static initLib() {
        if (this._libPromise) return this._libPromise;

        if (typeof window.Swiper === 'function') {
            this._libPromise = Promise.resolve();
        } else {

            // Load JS
            this._libPromise = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                Object.assign(script, {
                    id: 'wpbs-swiper-js',
                    src: 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js',
                    defer: true,
                    async: true,
                    onload: resolve,
                    onerror: reject
                });
                document.body.appendChild(script);
            });
        }
        return this._libPromise;
    }
}