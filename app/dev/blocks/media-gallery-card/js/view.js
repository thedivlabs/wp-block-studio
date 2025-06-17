import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs/media-gallery-card', {
    actions: {
        init: () => {

            const {ref: grid} = getElement();
            const context = JSON.parse(JSON.stringify(getContext()));

            //console.log(context);

        }
    },
});