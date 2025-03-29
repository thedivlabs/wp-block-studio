import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs', {
    callbacks: {
        observeSlider: () => {
            const {ref: element} = getElement();
            let {args} = getContext();

            args = JSON.parse(JSON.stringify(args))

            let observerIntersection = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {

                        observerIntersection.unobserve(entry.target);

                        async function initLib() {
                            if (typeof window.Swiper !== 'function') {

                                let stylesheet = document.createElement('link');
                                stylesheet.id = 'wpbs-swiper-styles';
                                stylesheet.rel = 'stylesheet';
                                stylesheet.type = 'text/css';
                                stylesheet.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';

                                document.head.appendChild(stylesheet);

                                return new Promise((resolve, reject) => {
                                    const script_tag = document.createElement('script');
                                    script_tag.id = 'wpbs-swiper-js';
                                    script_tag.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
                                    script_tag.defer = true;
                                    script_tag.onload = resolve;
                                    script_tag.onerror = reject;
                                    document.body.appendChild(script_tag);
                                });


                            } else {
                                return true;
                            }
                        }

                        initLib().then(() => {

                            const {args: defaultArgs} = WPBS.swiper;

                            console.log({
                                ...defaultArgs,
                                ...args,
                            });

                            const swiper = new Swiper(element, {
                                ...defaultArgs,
                                ...args,
                            });
                        })

                    }
                });

            }, {
                root: null,
                rootMargin: "90px",
                threshold: 0,
            });

            observerIntersection.observe(element);

        },
    }

});