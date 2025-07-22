import {getContext, getElement, store} from '@wordpress/interactivity';


const {state} = store('wpbs/site-header', {
    actions: {
        init: () => {

            const {ref: element} = getElement();

            const context = getContext();

            console.log(context);

        },
    },
});