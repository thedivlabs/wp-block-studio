import {getContext, getElement, store} from '@wordpress/interactivity';

function waitForOdometer(cb) {
    if (typeof Odometer !== 'undefined') {
        cb();
    } else {
        setTimeout(() => waitForOdometer(cb), 50);
    }
}

const {state} = store('wpbs/odometer', {
    actions: {
        init: () => {

            const {ref: element} = getElement();
            const context = getContext();
            const {start = 0, end = 100, duration = 1200, format = false} = context;

            waitForOdometer(() => {


                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const od = new Odometer({
                                el: element,
                                value: start,
                                duration: duration,
                                theme: 'default',
                                format: format ? '(,ddd).dd' : '',
                                framesPerSecond: 60,
                            });
                            od.update(end);
                        } else {
                            // Reset back to start when out of view
                            //od.update(start);
                        }
                    });
                }, {threshold: 0.3});

                observer.observe(element);
            });
        },
    },
});
