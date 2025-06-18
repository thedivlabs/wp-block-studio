import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs/wpbs-media-gallery', {
    actions: {
        init: () => {

            const {ref: grid} = getElement();
            const context = JSON.parse(JSON.stringify(getContext()));

            //console.log(context);

        }
    },
});