import {store, getElement, getContext} from '@wordpress/interactivity';

async function fetchGrid(data = {}) {
    const endpoint = '/wp-json/wpbs/v1/layout-grid';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': WPBS?.settings?.nonce_rest ?? '',
            },
            body: JSON.stringify({
                ...data,
            }),
        });

        return await response.json();

    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}


const {state} = store('wpbs/layout-grid', {
    actions: {
        init: () => {

            const {ref: element} = getElement();
            const container = element.querySelector(':scope > .loop-container');
            const args = JSON.parse(element.querySelector('script.wpbs-args')?.textContent ?? '{}');

            const {settings, uniqueId} = args;

            WPBS.setMasonry(container);

            WPBS.gridDividers(element, settings, args?.uniqueId ?? context?.uniqueId);


        },
        pagination: async (event) => {

            event.preventDefault();

            const {ref: button} = getElement();

            const grid = button.closest('.wpbs-layout-grid');
            const container = grid.querySelector(':scope > .loop-container');

            const args = JSON.parse(grid.querySelector('script.wpbs-args')?.textContent ?? '{}');

            const page = parseInt(grid.dataset?.page ?? 1);
            const next_page = page + 1;

            const {card, uniqueId, query, settings} = args;

            const request = {
                uniqueId: uniqueId,
                context: {
                    'wpbs/page': next_page,
                    'wpbs/query': query,
                    'wpbs/grid': settings,
                    'wpbs/card': card
                }
            };

            WPBS.loader.toggle();

            fetchGrid(request).then((result) => {

                WPBS.loader.toggle({
                    remove: true
                });

                const parser = new DOMParser();

                grid.dataset.page = String(next_page);

                const grid_container = parser.parseFromString(result?.rendered ?? '', 'text/html').querySelector('.loop-container');

                if (!grid_container) {
                    return false;
                }

                const grid_cards = grid_container.querySelectorAll('.loop-card');
                const is_last = grid_container.classList.contains('--last-page');

                if (is_last) {
                    button.remove();
                }

                if (grid_cards) {

                    [...grid_cards].forEach(node => {
                        container.append(node);
                    })

                }

                WPBS.gridDividers(grid, settings, uniqueId);

                if (!!args?.masonry) {
                    WPBS.setMasonry(container);
                }

                WPBS.observeMedia(container);

            })


        }
    },
});