import {getContext, getElement, store} from '@wordpress/interactivity';


const {state} = store('wpbs/odometer', {
    actions: {
        init: () => {

            const {ref: element} = getElement();
            const context = getContext();
            const {start = 0, end = 100, duration = 1200, format = false} = context;

            let od;

            function waitForOdometer(cb) {
                if (typeof Odometer !== 'undefined') {
                    od = new Odometer({
                        el: element,
                        value: start,
                        duration: duration,
                        theme: 'default',
                        format: format ? '(,ddd).dd' : '',
                        framesPerSecond: 60,
                    });
                    cb();
                } else {
                    setTimeout(() => waitForOdometer(cb), 100);
                }
            }

            waitForOdometer(() => {


                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            od.update(end);
                        } else {
                            od.update(start);
                        }
                    });
                }, {threshold: 0.3});

                observer.observe(element);
            });
        },
    },
});
