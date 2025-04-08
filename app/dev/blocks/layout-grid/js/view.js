import {store, getElement, getContext} from '@wordpress/interactivity';

const {state} = store('wpbs/grid', {
    callbacks: {
        init: async () => {
            const {ref: element} = getElement();
            const container = element.querySelector(':scope > .wpbs-layout-grid__container');
            const context = JSON.parse(JSON.stringify(getContext()));

            const innerBlocks = element.dataset.innerblocks;

            //console.log(context);
            console.log(innerBlocks);

            const response = await fetch('/wp-json/wp/v2/block-renderer/wpbs/layout-grid', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': wpbsData.nonce,
                },
                body: JSON.stringify({
                    name: 'wpbs/layout-grid',
                    attributes: {
                        ...context,
                        cardTemplate: innerBlocks,
                    },
                    context: 'edit',
                }),
            });

            const result = await response.json();

            container.innerHTML = result.rendered;

            console.log(result);

        }
    },

});