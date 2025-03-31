import {store, getElement, getContext} from '@wordpress/interactivity';

const {state} = store('wpbs/grid', {
    callbacks: {
        runQuery: () => {
            const {ref: element} = getElement();

            const queryArgs = JSON.parse(JSON.stringify(getContext().queryArgs || {}));

            console.log(element);
            console.log(queryArgs);


        }
    },

});