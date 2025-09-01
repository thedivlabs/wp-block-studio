import {getContext, getElement, store} from '@wordpress/interactivity';

const {state} = store('wpbs/odometer', {
    actions: {
        init: () => {
            const {ref: element} = getElement();
            const context = getContext();
            const {start = 0, end = 100, duration = 1200, format = false} = context;
            const link_ID = 'wpbs-odometer-css';
            const script_ID = 'wpbs-odometer-js';

            if (typeof Odometer !== 'undefined') {
                const od = new Odometer({
                    el: element,
                    value: start,
                    duration: duration,
                    theme: 'default',
                    format: format ? '(,ddd).dd' : '',
                    framesPerSecond: 60,
                });

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // Animate to final value when in view
                            od.update(end);
                        } else {
                            // Reset back to start when out of view
                            od.update(start);
                        }
                    });
                }, {threshold: 0.3});

                observer.observe(element);
            }
        },
    },
});
