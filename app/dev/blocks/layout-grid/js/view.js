import {store, getElement, getContext} from '@wordpress/interactivity';
import {string} from "../../../../public/wp-includes/js/clipboard";

const {state} = store('wpbs/grid', {
    actions: {
        pagination: async () => {
            const {ref: element} = getElement();
            const grid = element.closest('.wpbs-layout-grid');
            const container = grid.querySelector(':scope > .wpbs-layout-grid__container');
            const page = parseInt(grid.dataset.page ? grid.dataset.page : 2);

            grid.dataset.page = String(page + 1);

            const data = JSON.parse(grid.querySelector('script.wpbs-layout-grid-args')?.innerHTML || '');

            const nonce = 'wpbsData' in window ? window.wpbsData?.nonce : false;

            const response = await fetch('/wp-json/wpbs/v1/layout-grid', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': nonce,
                },
                body: JSON.stringify({
                    card: data.card,
                    attrs: data.attrs,
                    page: page,
                }),
            });


            const result = await response.json();

            element.insertAdjacentHTML('beforebegin', result.response);

            if (!!result.last) {
                element.remove();
            }

        }
    },

});