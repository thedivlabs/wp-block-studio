import {SWIPER_ARGS_VIEW} from 'Includes/config';
import merge from 'lodash/merge';

export default class Slider {

    // --- Constants from view.js scope ---
    static SPECIAL_PROP_MAP = {
        enabled: (val) => !val, // Invert for Swiper: 'enabled: true' in props means swiper is enabled
    };
    static propsToSuppress = ['enabled']; // List of base props to suppress from breakpoints
    // ------------------------------------

    /**
     * Initializes all Swiper instances on the page by querying the DOM.
     * Processes Slaves first to ensure they start the library load and are ready (uninitialized) in the DOM
     * when the Master's Observer runs.
     */
    static init() {
        const allSliderElements = Array.from(document.querySelectorAll('.wpbs-slider.swiper'));

        const slaves = allSliderElements.filter(el => el.classList.contains('--slave'));
        const masters = allSliderElements.filter(el => el.classList.contains('--master'));
        const others = allSliderElements.filter(el => !el.classList.contains('--slave') && !el.classList.contains('--master'));

        // Process in the order: Slaves, then Others, then Masters (who handle linking)
        [...slaves, ...others, ...masters].forEach(element => {
            const rawArgs = this.getRawContext(element);
            const swiperArgs = this.normalizeAndGetSwiperArgs(rawArgs);
            this.observe(element, swiperArgs);
        });
    }

    // --- Data Retrieval & Normalization Logic (Unchanged) ---

    static getRawContext(element) {
        const configAttr = element.dataset?.context;
        if (configAttr) {
            try {
                return JSON.parse(configAttr);
            } catch (e) {
                console.error('Error parsing Swiper config JSON from data-context:', e);
            }
        }
        return {props: {}, breakpoints: {}};
    }

    static normalizeAndGetSwiperArgs(rawArgs) {
        const breakpointsConfig = WPBS?.settings?.breakpoints ?? {};
        const swiperArgs = {breakpoints: {}};
        const normalizeProp = (key, value) => {
            if (value === 'true') value = true;
            else if (value === 'false') value = false;
            else if (typeof value === 'string' && value !== '' && !isNaN(Number(value))) value = Number(value);
            if (this.SPECIAL_PROP_MAP[key]) {
                value = this.SPECIAL_PROP_MAP[key](value);
            }
            return value;
        };
        const baseProps = rawArgs.props || {};
        for (const key in baseProps) {
            swiperArgs[key] = normalizeProp(key, baseProps[key]);
        }
        const rawBreakpoints = rawArgs.breakpoints || {};
        for (const customKey in rawBreakpoints) {
            const bpMap = breakpointsConfig[customKey];
            if (!bpMap?.size || !rawBreakpoints[customKey].props) continue;
            const bpProps = rawBreakpoints[customKey].props || {};
            const normalizedBpProps = {};
            for (const key in baseProps) {
                if (!this.propsToSuppress.includes(key)) {
                    normalizedBpProps[key] = normalizeProp(key, baseProps[key]);
                }
            }
            for (const key in bpProps) {
                normalizedBpProps[key] = normalizeProp(key, bpProps[key]);
            }
            swiperArgs.breakpoints[bpMap.size] = normalizedBpProps;
        }
        return swiperArgs;
    }

    // --- Original Methods (Used to merge and initialize) ---

    static mergeArgs(element, args = {}) {
        const merged = merge({}, SWIPER_ARGS_VIEW);
        const isMaster = element.classList.contains('--master');

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

        const controllerType = isMaster ? 'container' : (args.controller?.by || 'slide');
        merged.controller = merge({}, merged.controller, {
            by: controllerType
        });

        if (element.classList.contains('--slave')) {
            merged.touchRatio = 0;
            merged.navigation = false;
            merged.pagination = false;
            delete merged.allowTouchMove;
            delete merged.keyboard;
        }
        return merged;
    }

    /**
     * 🟢 REVISED: Uses Observer for Masters/Others, immediate initialization for Slaves.
     */
    static observe(element, args = {}) {
        if (element.classList.contains('swiper-initialized')) return;

        const mergedArgs = Object.fromEntries(
            Object.entries(this.mergeArgs(element, args)).filter(
                ([key, value]) => value !== undefined && value !== null && value !== ""
            )
        );
        const controllerId = element.getAttribute('data-slider-controller');
        const isMaster = element.classList.contains('--master');
        const isSlave = element.classList.contains('--slave'); // NEW CHECK

        const slides = element.querySelectorAll(':scope > .swiper-wrapper > .swiper-slide');
        if (slides.length <= 1) return;
        
        const initFn = () => {
            // This is the working initFn logic (Master initializes itself, then initializes uninitialized linked elements)

            // New Swiper instance
            const swiperInstance = new Swiper(element, mergedArgs);
            element.swiper = swiperInstance;
            swiperInstance.update();

            // Master linking (Handles bidirectional control for all linked sliders)
            if (isMaster && controllerId) {
                // Find ALL related sliders (master itself + all slaves)
                const allLinkedElements = document.querySelectorAll(
                    `.wpbs-slider.swiper[data-slider-controller="${controllerId}"]`
                );

                const allLinkedInstances = [];

                allLinkedElements.forEach(linkedEl => {
                    let instance;
                    if (!linkedEl.classList.contains('swiper-initialized')) {
                        // Initialize any uninitialized linked element (this handles slaves and other masters that haven't been observed yet)
                        const linkedArgs = this.mergeArgs(linkedEl, {});
                        instance = new Swiper(linkedEl, linkedArgs);
                        linkedEl.swiper = instance;
                        instance.update();
                    } else {
                        // Element was already initialized (usually the Master itself, or a Slave that initialized immediately)
                        instance = linkedEl.swiper;
                    }

                    if (instance) {
                        allLinkedInstances.push(instance);
                    }
                });

                // --- BIDIRECTIONAL CONTROL FIX ---
                if (allLinkedInstances.length > 1) {
                    allLinkedInstances.forEach(currentInstance => {
                        currentInstance.controller.control = allLinkedInstances.filter(
                            targetInstance => targetInstance !== currentInstance
                        );
                        currentInstance.update();
                    });
                }
            }
        };

        // 🟢 CONDITIONAL LOADING LOGIC 🟢

        if (isSlave) {
            // ➡️ SLAVES: Must initialize immediately to be present in the DOM with the 'swiper-initialized' class
            // and the 'element.swiper' property, so the Master can find and link them correctly later.
            // This also ensures the Swiper library load starts as early as possible.
            this.initLib().then(initFn).catch(console.error);
        } else {
            // ➡️ MASTERS / OTHERS: Use Intersection Observer for lazy loading.
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