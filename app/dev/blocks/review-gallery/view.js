import {getContext, getElement, store} from '@wordpress/interactivity';


const {state} = store('wpbs/review-gallery', {
    actions: {
        init: () => {

            const {ref: element} = getElement();

            const context = getContext();

            const {slider: swiper_args} = context;

            if (!swiper_args) {
                return;
            }

            WPBS.slider.observe(element, JSON.parse(JSON.stringify(swiper_args)));


        },
    },
});