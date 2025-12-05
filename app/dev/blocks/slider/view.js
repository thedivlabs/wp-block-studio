// view.js
import {store, getElement, getContext} from '@wordpress/interactivity';

store('wpbs/slider', {
    actions: {
        observeSlider: () => {
            const {ref: element} = getElement();
            const {context} = getContext();

            const args = JSON.parse(JSON.stringify(context));
            console.log(args);
            // now the slider gets initialized automatically
            WPBS.slider.observe(element, args);
        },
    },
});
