import {store, getElement, getContext} from '@wordpress/interactivity';

store('wpbs/slider', {
    actions: {
        observe: () => {
            const {ref: element} = getElement();
            const rawArgs = getContext();

            
            const breakpointsConfig = WPBS?.settings?.breakpoints ?? {};

            // Start with base properties
            const swiperArgs = {
                breakpoints: {},
            };

            // --- Map and Convert Base Props ---
            const baseProps = rawArgs.props || {};
            for (const key in baseProps) {
                let value = baseProps[key];

                // Convert string values to correct types (number/boolean)
                if (value === 'true') value = true;
                else if (value === 'false') value = false;
                // Convert number strings (like "1", "200") to actual numbers
                else if (value !== '' && !isNaN(Number(value))) value = Number(value);

                swiperArgs[key] = value;
            }

            // --- Map Breakpoints to Swiper's Numeric Keys and Convert Props ---
            const rawBreakpoints = rawArgs.breakpoints || {};
            for (const customKey in rawBreakpoints) {
                const bpMap = breakpointsConfig[customKey]; // e.g., {size: 640, ...}

                // If the pixel size is available, use it as the key
                if (bpMap?.size) {
                    const breakpointProps = {};
                    const rawBpProps = rawBreakpoints[customKey].props;

                    // Normalize the props within this breakpoint
                    for (const key in rawBpProps) {
                        let value = rawBpProps[key];
                        // Convert string values to correct types (number/boolean)
                        if (value === 'true') value = true;
                        else if (value === 'false') value = false;
                        else if (value !== '' && !isNaN(Number(value))) value = Number(value);

                        breakpointProps[key] = value;
                    }

                    // Map the custom key (e.g., 'xs') to its pixel size (e.g., 640)
                    swiperArgs.breakpoints[bpMap.size] = breakpointProps;
                }
            }

            console.log(swiperArgs);

            // The swiperArgs object now has the correct shape and data types
            WPBS.slider.observe(element, swiperArgs);
        },
    },
});