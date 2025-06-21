import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs/grid', {
    actions: {
        init: () => {

            const {ref: grid} = getElement();
            const data = JSON.parse(grid.querySelector('script.wpbs-layout-grid-args')?.innerHTML ?? '{}');

            const {page = 1, max = 1} = data;

            WPBS.setMasonry(grid);

            WPBS.gridDividers(grid, data);

            [...grid.querySelectorAll('.wpbs-layout-grid__button')].forEach((el) => {
                if (!data?.last) {
                    el.classList.remove('hidden');
                } else {
                    el.remove();
                }
            })


        },
        pagination: async () => {

            const {ref: element} = getElement();
            const parser = new DOMParser();

            const grid = element.closest('.wpbs-layout-grid');
            const container = grid.querySelector(':scope > .wpbs-layout-grid__container');
            const data = JSON.parse(grid.querySelector('script.wpbs-layout-grid-args')?.innerHTML ?? '{}');

            const {page = 1, query, max = 1, card} = data;

            grid.dataset.page = String(parseInt(grid.dataset?.page ?? page) + 1);

            const nonce = WPBS?.settings?.nonce ?? false;

            const endpoint = '/wp-json/wpbs/v1/layout-grid';

            const request = {
                card: card,
                query: query,
                page: grid.dataset.page,
            };

            WPBS.loader.toggle();

            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': nonce,
                },
                body: JSON.stringify(request),
            }).then(response => response.json())
                .then(result => {

                    WPBS.loader.toggle({
                        remove: true
                    });
                    
                    const newNodes = parser.parseFromString(result.content, 'text/html');
                    container.append(...newNodes.body.childNodes);

                    WPBS.gridDividers(grid, data);
                    WPBS.setMasonry(grid);

                    [...grid.querySelectorAll('[data-src],[data-srcset]')].forEach((el) => WPBS.observeMedia(el));


                    if (result.css) {
                        const styleTag = document.createElement('style');

                        styleTag.innerHTML = result.css;

                        document.head.appendChild(styleTag);
                    }

                    if (!!result.last) {
                        element.remove();
                    }

                })
        }
    },
});