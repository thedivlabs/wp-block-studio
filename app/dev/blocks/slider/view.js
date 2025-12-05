import { store, getElement, getContext } from '@wordpress/interactivity';

const SPECIAL_PROP_MAP = {
    // propName: transformFunction
    enabled: (val) => !val, // invert for Swiper
    // add more special cases here if needed
};

store('wpbs/slider', {
    actions: {
        observe: () => {
            const { ref: element } = getElement();
            const rawArgs = getContext();
            const breakpointsConfig = WPBS?.settings?.breakpoints ?? {};

            const swiperArgs = { breakpoints: {} };

            const normalizeProp = (key, value) => {
                if (value === 'true') value = true;
                else if (value === 'false') value = false;
                else if (typeof value === 'string' && value !== '' && !isNaN(Number(value))) value = Number(value);

                if (SPECIAL_PROP_MAP[key]) {
                    value = SPECIAL_PROP_MAP[key](value);
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
                if (bpMap?.size) {
                    const bpProps = rawBreakpoints[customKey].props || {};
                    const normalizedBpProps = {};

                    // Copy all base props first
                    for (const key in baseProps) {
                        normalizedBpProps[key] = normalizeProp(key, baseProps[key]);
                    }

                    // Then override with breakpoint-specific props
                    for (const key in bpProps) {
                        normalizedBpProps[key] = normalizeProp(key, bpProps[key]);
                    }

                    swiperArgs.breakpoints[bpMap.size] = normalizedBpProps;
                }
            }

            WPBS.slider.observe(element, swiperArgs);
        },
    },
});