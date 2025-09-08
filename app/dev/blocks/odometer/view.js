import {getContext, getElement, store} from '@wordpress/interactivity';


const {state} = store('wpbs/odometer', {
    actions: {
        init: () => {

            const {ref: element} = getElement();
            const context = getContext();
            const {start = 0, end = 100, duration = 1200, format = false} = context;

            let od;

            window.odometerOptions = {
                auto: false
            }

            function waitForOdometer(cb) {
                if (typeof Odometer !== 'undefined') {
                    cb();
                } else {
                    setTimeout(() => waitForOdometer(cb), 100);
                }
            }

            waitForOdometer(() => {


                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {

                            //observer.unobserve(element);

                            if (!od) {
                                console.log(od);
                                requestAnimationFrame(() => {
                                    od = (new Odometer({
                                        el: element,
                                        value: start,
                                        duration: duration,
                                        theme: 'default',
                                        format: format ? '(,ddd).dd' : '',
                                        framesPerSecond: 60,
                                    }));
                                    od.update(end);
                                })

                            } else {
                                console.log(od);
                                requestAnimationFrame(() => {
                                    od.update(end);
                                })

                            }
                        } else {
                            if (!!od?.el) {
                                console.log('Return');
                                requestAnimationFrame(() => {
                                    od.update(start);
                                })

                            }

                        }
                    });
                }, {threshold: 0.3});

                observer.observe(element);
            });
        },
    },
});
