import {store, getElement, getContext} from '@wordpress/interactivity';

const {state} = store('wpbs/layout-grid-card', {
    callbacks: {
        init: async () => {
            const {ref: element} = getElement();
            const container = element.querySelector(':scope > .wpbs-layout-grid__container');
            const context = getContext();
            
        },
    },
});