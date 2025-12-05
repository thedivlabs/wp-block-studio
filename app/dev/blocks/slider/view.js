import {getElement, store} from '@wordpress/interactivity';

store('wpbs/slider', {
    actions: {
        observe: () => {
            const {ref: element, context: rawArgs} = getElement();
            // Assuming this object is globally available and contains the pixel sizes
            const breakpointsConfig = WPBS?.settings?.breakpoints ?? {};

            // Start with base properties
            const swiperArgs = {
                breakpoints: {},
            };

            // --- Map Base Props ---
            const baseProps = rawArgs.props || {};
            for (const key in baseProps) {
                // Assigns the string value directly (e.g., "1", "200")
                swiperArgs[key] = baseProps[key];
            }

            // --- Map Breakpoints to Swiper's Numeric Keys ---
            const rawBreakpoints = rawArgs.breakpoints || {};
            for (const customKey in rawBreakpoints) {
                const bpMap = breakpointsConfig[customKey]; // e.g., {size: 640, ...}

                // If the pixel size is available, use it as the key
                if (bpMap?.size) {
                    // Assign the breakpoint properties directly (they are also strings)
                    swiperArgs.breakpoints[bpMap.size] = rawBreakpoints[customKey].props;
                }
            }

            // The swiperArgs object now has the correct shape, but still contains string values
            WPBS.slider.observe(element, swiperArgs);
        },
    },
});