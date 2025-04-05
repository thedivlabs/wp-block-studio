import {store, getElement, getContext} from '@wordpress/interactivity';

const {state} = store('wpbs/grid', {
    callbacks: {
        init: () => {
            const {ref: element} = getElement();
            const container = element.querySelector(':scope > .wpbs-layout-grid__container');

        }
    },

});