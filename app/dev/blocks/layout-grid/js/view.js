import {store, getElement, getContext} from '@wordpress/interactivity';

const {state} = store('wpbs/grid', {
    callbacks: {
        runQuery: async () => {
            const {ref: element} = getElement();

            const queryArgs = JSON.parse(JSON.stringify(getContext().queryArgs || {}));
            const blocks = JSON.parse(JSON.stringify(getContext().blocks || {}));

            console.log(element);
            console.log(JSON.stringify(queryArgs));
            fetch('/wp-json/wpbs/v2/grid/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    queryArgs: queryArgs,
                    blocks: blocks
                })
            })
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    console.log(data); // Handle the data
                })


        }
    },

});