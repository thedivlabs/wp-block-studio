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
     */
    static init() {
        // --- OPTIMIZATION: Process Slaves first, then Masters ---
        // This ensures Slaves are ready when Masters try to link all controlled instances.
        const allSliderElements = Array.from(document.querySelectorAll('.wpbs-slider.swiper'));

        const slaves = allSliderElements.filter(el => el.classList.contains('--slave'));
        const masters = allSliderElements.filter(el => el.classList.contains('--master'));
        const others = allSliderElements.filter(el => !el.classList.contains('--slave') && !el.classList.contains('--master'));

        // Process in the order: Slaves, then Others, then Masters (who handle linking)
        [...slaves, ...others, ...masters].forEach(element => {
            const rawArgs = this.getRawContext(element);
            const swiperArgs = this.normalizeAndGetSwiperArgs(rawArgs);
            // 🟢 Pass the processed config to the immediate initializer
            this.observe(element, swiperArgs);
        });
    }

    // --- Data Retrieval & Normalization Logic ---

    /**
     * Reads the raw configuration JSON from the 'data-context' attribute.
     */
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

    /**
     * Contains the core logic from the old view.js to normalize and merge props.
     */
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

        // --- Base Props ---
        const baseProps = rawArgs.props || {};
        for (const key in baseProps) {
            swiperArgs[key] = normalizeProp(key, baseProps[key]);
        }

        // --- Breakpoints ---
        const rawBreakpoints = rawArgs.breakpoints || {};
        for (const customKey in rawBreakpoints) {
            const bpMap = breakpointsConfig[customKey];
            if (!bpMap?.size || !rawBreakpoints[customKey].props) continue;

            const bpProps = rawBreakpoints[customKey].props || {};
            const normalizedBpProps = {};

            // Copy all base props first, except suppressed keys
            for (const key in baseProps) {
                if (!this.propsToSuppress.includes(key)) {
                    normalizedBpProps[key] = normalizeProp(key, baseProps[key]);
                }
            }

            // Then override with breakpoint-specific props
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

        // Determine if this instance is the Master
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

        // Apply all normalized props from the block context (WITHOUT altering them)
        Object.keys(args).forEach(key => {
            if (key !== 'navigation' && key !== 'pagination') {
                merged[key] = args[key];
            }
        });

        // --- CONTROLLER FIX ---
        // Use 'container' control for Masters for optimal synchronization
        const controllerType = isMaster ? 'container' : (args.controller?.by || 'slide');

        merged.controller = merge({}, merged.controller, {
            by: controllerType
        });
        // ----------------------

        // --- SLAVE CONTROL FIX (FOR LOCKOUT) ---
        if (element.classList.contains('--slave')) {
            // Use touchRatio: 0 to disable all user interaction, which is safer than using allowTouchMove=false
            merged.touchRatio = 0;
            // Explicitly disable navigation/pagination UI if they exist.
            merged.navigation = false;
            merged.pagination = false;
            // Removed redundant/conflicting properties from the base code:
            delete merged.allowTouchMove;
            delete merged.keyboard;
        }
        // -----------------------------

        return merged;
    }

    // ⛔️ MODIFIED: Bypasses IntersectionObserver and initializes immediately.
    static observe(element, args = {}) {
        if (element.classList.contains('swiper-initialized')) return;

        // args is the fully processed config from normalizeAndGetSwiperArgs
        const mergedArgs = Object.fromEntries(
            Object.entries(this.mergeArgs(element, args)).filter(
                ([key, value]) => value !== undefined && value !== null && value !== ""
            )
        );
        const controllerId = element.getAttribute('data-slider-controller');
        const isMaster = element.classList.contains('--master');

        // Check slide count early
        const slides = element.querySelectorAll(':scope > .swiper-wrapper > .swiper-slide');
        if (slides.length <= 1) return;

        console.log(mergedArgs);

        const initFn = () => {
            // New Swiper instance
            const swiperInstance = new Swiper(element, mergedArgs);
            element.swiper = swiperInstance;

            // Explicitly update Swiper instance to force layout calculation
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
                        // Initialize any uninitialized linked element
                        const linkedArgs = this.mergeArgs(linkedEl, {});
                        instance = new Swiper(linkedEl, linkedArgs);
                        linkedEl.swiper = instance;
                        instance.update();
                    } else {
                        instance = linkedEl.swiper;
                    }

                    if (instance) {
                        allLinkedInstances.push(instance);
                    }
                });

                // --- BIDIRECTIONAL CONTROL FIX ---
                // Link ALL sliders to ALL other sliders in the group.
                if (allLinkedInstances.length > 1) {
                    allLinkedInstances.forEach(currentInstance => {
                        // Control array contains all other instances in the group
                        currentInstance.controller.control = allLinkedInstances.filter(
                            targetInstance => targetInstance !== currentInstance
                        );
                        currentInstance.update();
                    });
                }
                // ---------------------------------
            }

            // Note: The original separate Slave linking block is no longer needed
            // because the Master linking block handles the initialization and linking
            // of ALL related sliders in one pass.
        };

        // 🟢🟢 BYPASS: Call initialization immediately without waiting for intersection.
        this.initLib().then(initFn).catch(console.error);
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