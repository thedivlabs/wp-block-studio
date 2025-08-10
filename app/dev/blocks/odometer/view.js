import {getContext, getElement, store} from '@wordpress/interactivity';

const {state} = store('wpbs/odometer', {
    actions: {
        init: () => {

            const {ref: element} = getElement();
            const context = getContext();

            const {start = 0, end = 100, duration = 1200} = context;

            // Inject AOS CSS
            const link = document.createElement('link');
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/odometer.js/0.4.8/themes/odometer-theme-default.min.css';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            document.head.appendChild(link);

            // Load AOS JS dynamically
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/odometer.js/0.4.8/odometer.min.js';
            script.onload = () => {
                if (typeof Odometer !== 'undefined') {
                    new Odometer({
                        el: element,
                        value: end,

                        // Any option (other than auto and selector) can be passed in here
                        //format: '',
                        //theme: 'digital'
                    });
                }
            };
            document.body.appendChild(script);

        },
    },
});