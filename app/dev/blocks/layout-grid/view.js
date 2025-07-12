import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs/layout-grid', {
    actions: {
        init: () => {

            const {ref: element} = getElement();

            const context = getContext();

            WPBS.setMasonry(element);

            WPBS.gridDividers(element, context, context?.uniqueId);


        },
        pagination: async (event) => {

            event.preventDefault();

            const {ref: element} = getElement();
            const parser = new DOMParser();

            const grid = element.closest('.wpbs-layout-grid');
            const container = grid.querySelector(':scope > .loop-container');
            const data = JSON.parse(grid.querySelector('script.wpbs-args')?.textContent ?? '{}');
            const context = getContext();

            const {query, card} = data;

            grid.dataset.page = String(parseInt(grid.dataset?.page ?? 1) + 1);
            query.paged = grid.dataset.page;

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

                    const {is_last, content, css} = result ?? {};

                    if (!!is_last || !content) {
                        element.remove();
                        //return;
                    }


                    const newNodes = parser.parseFromString(content, 'text/html');

                    if (newNodes) {
                        container.append(...newNodes.body.childNodes);
                    }

                    WPBS.gridDividers(grid, context, context?.uniqueId);
                    WPBS.setMasonry(grid);

                    [...grid.querySelectorAll('[data-src],[data-srcset]')].forEach((el) => WPBS.observeMedia(el));

                    if (css) {
                        const styleTag = document.createElement('style');
                        styleTag.innerHTML = css;
                        document.head.appendChild(styleTag);
                    }


                })
        }
    },
});