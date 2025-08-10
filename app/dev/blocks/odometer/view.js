import {getContext, getElement, store} from '@wordpress/interactivity';

const {state} = store('wpbs/odometer', {
    actions: {
        init: () => {
            const {ref: element} = getElement();
            const context = getContext();
            const {start = 0, end = 100, duration = 1200, format = '(,ddd).dd'} = context;

            // Inject Odometer CSS
            const link = document.createElement('link');
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/odometer.js/0.4.8/themes/odometer-theme-default.min.css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);

            // Load Odometer JS dynamically
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/odometer.js/0.4.8/odometer.min.js';
            script.onload = () => {
                if (typeof Odometer !== 'undefined') {
                    const od = new Odometer({
                        el: element,
                        value: start,
                        duration: duration,
                        theme: 'default',
                        format: format,
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
            };
            document.body.appendChild(script);
        },
    },
});
