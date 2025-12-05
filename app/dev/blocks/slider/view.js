import {store, getElement, getContext} from '@wordpress/interactivity';

store('wpbs/slider', {
    callbacks: {
        observeSlider: () => {
            const {ref: element} = getElement();
            const {context} = getContext();

            const args = JSON.parse(JSON.stringify(context));
            console.log(args);
            
            WPBS.slider.observe(element, args);
        },
    },
});
