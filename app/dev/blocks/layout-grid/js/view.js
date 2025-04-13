import {store, getElement, getContext} from '@wordpress/interactivity';

const {state} = store('wpbs/grid', {
    actions: {
        pagination: async () => {
            const {ref: element} = getElement();
            const grid = element.closest('.wpbs-layout-grid');
            const container = grid.querySelector(':scope > .wpbs-layout-grid__container');
            const page = parseInt(grid.dataset.page ? grid.dataset.page : 2);
            console.log(page);
            grid.dataset.page = page + 1;
            console.log(grid.dataset.page);

            const data = JSON.parse(grid.querySelector('script.wpbs-layout-grid-args')?.innerHTML || '');

            const nonce = 'wpbsData' in window ? window.wpbsData?.nonce : false;

            console.log({
                card: data.card,
                attrs: data.attrs,
            });

            const response = await fetch('/wp-json/wpbs/v1/layout-grid', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    //'X-WP-Nonce': nonce,
                },
                body: JSON.stringify({
                    card: data.card,
                    attrs: data.attrs,
                    page: page,
                    nonce: nonce,
                }),
            });


            const result = await response.json();

            element.insertAdjacentHTML('beforebegin', result.response);

            console.log(result);

        }
    },

});