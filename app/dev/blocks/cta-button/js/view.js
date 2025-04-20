import {store, getElement, getContext} from '@wordpress/interactivity';



const {state} = store('wpbs/cta-button', {
    actions: {
        popup: () => {

            const {ref: element} = getElement();
            const context = JSON.parse(JSON.stringify(getContext()));

            console.log(element);
            console.log(context);
        }
    },
});