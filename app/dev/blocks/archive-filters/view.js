import {getElement, store} from '@wordpress/interactivity';

const {state} = store('wpbs/archive-filters', {
    actions: {
        toggle: (event) => {

            const {ref} = getElement();

        },
    },
});
