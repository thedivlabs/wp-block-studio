import {store, getElement, getContext} from '@wordpress/interactivity';

const {state} = store('wpbs-slide', {
    callbacks: {
        observe: () => {
            const {ref: element} = getElement();

            WPBS.observeMedia(element);

        },
    }

});