import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs/content-tabs', {

    actions: {
        init: () => {

            const {ref: component} = getElement();

            console.log(component);

        }
    }


});