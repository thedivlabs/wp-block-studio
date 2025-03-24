import {store, getContext, getElement} from '@wordpress/interactivity';

const {state} = store('wpbs', {
    callbacks: {
        observe: () => {
            const {ref: element} = getElement();

            let observerIntersection = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {

                        const image = entry.target;
                        observerIntersection.unobserve(entry.target);

                        if (image.dataset.src) {
                            image.src = image.dataset.src;
                            image.removeAttribute('data-src');
                        }

                        if (image.dataset.srcset) {
                            image.srcset = image.dataset.srcset;
                            image.removeAttribute('data-srcset');
                        }

                    }
                });

            }, {
                root: null,
                rootMargin: "90px",
                threshold: 0,
            });

            [...element.querySelectorAll('[data-src],[data-srcset]')].forEach((media) => {
                observerIntersection.observe(media);
            });


        },
    },
});