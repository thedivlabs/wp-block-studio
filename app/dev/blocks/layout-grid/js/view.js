import {store, getElement, getContext, withScope} from '@wordpress/interactivity';

const {state} = store('wpbs/grid', {
    callbacks: {
        dividers: (grid) => {

            if (!grid) {
                const {ref: gridElement} = getElement();

                grid = gridElement;
            }

            const container = grid.querySelector(':scope > .wpbs-layout-grid__container');

            const cards = container.querySelectorAll('.wpbs-layout-grid-card');

            [...cards].forEach((card) => {
                card.classList.remove('last-row');
                card.classList.remove('first-row');
            });

            const columns = Number(getComputedStyle(grid).getPropertyValue('--columns').trim());

            const total = cards.length;

            const firstRowItems = Array.from(cards).slice(0, columns);

            const lastRowCount = total % columns || columns;

            const lastRowStartIndex = total - lastRowCount;

            const lastRowItems = Array.from(cards).slice(lastRowStartIndex);

            lastRowItems.forEach(item => item.classList.add('last-row'));

            firstRowItems.forEach((item) => {
                item.classList.add('first-row');
                item.classList.remove('last-row');
            });

            console.log(firstRowItems);
            console.log(lastRowItems);


        },
    },
    actions: {
        pagination: async () => {
            const {callbacks} = store('wpbs/grid');

            const {ref: element} = getElement();
            const grid = element.closest('.wpbs-layout-grid');
            const container = grid.querySelector(':scope > .wpbs-layout-grid__container');
            const page = parseInt(grid.dataset.page ? grid.dataset.page : 2);
            grid.dataset.page = String(page + 1);

            const data = JSON.parse(grid.querySelector('script.wpbs-layout-grid-args')?.innerHTML || '');

            const nonce = 'wpbsData' in window ? window.wpbsData?.nonce : false;

            console.log({
                card: data.card,
                query: data.query,
                attrs: data.attrs,
                page: page,
                nonce: nonce,
            });

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
                    query: data.query,
                }),
            });


            const result = await response.json();

            element.insertAdjacentHTML('beforebegin', result.response);

            callbacks.dividers(grid);


            if (!!result.last) {
                element.remove();
            }

        }
    },

});