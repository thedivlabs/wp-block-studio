import {store, getContext, getElement} from '@wordpress/interactivity';

const {state} = store('wpbs', {
    callbacks: {
        observe: () => {
            const {ref: element} = getElement();

            WPBS.observeMedia(element);

        },
    },
});