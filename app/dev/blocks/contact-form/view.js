import {store, getElement} from '@wordpress/interactivity';


const {state} = store('wpbs/contact-form', {
    actions: {
        init: () => {

            const {ref: element} = getElement();


        }
    },
});