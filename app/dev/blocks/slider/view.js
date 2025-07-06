import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs/slider', {
    callbacks: {
        observeSlider: () => {
            const {ref: element} = getElement();

            let {args} = getContext();

            WPBS.slider.observe(element, args);

        },
    }

});