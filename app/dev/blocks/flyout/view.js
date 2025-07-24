import {getContext, getElement, store} from '@wordpress/interactivity';


const {state} = store('wpbs/flyout', {
    actions: {
        init: () => {

            const {ref: element} = getElement();

            console.log(element);


        },
    },
});