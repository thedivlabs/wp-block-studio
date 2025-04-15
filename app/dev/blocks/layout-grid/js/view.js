import {store, getElement, getContext} from '@wordpress/interactivity';

function setDividers({grid, uniqueId, breakpoints}) {

    grid.classList.add('wpbs-layout-grid--divider');

    breakpoints = JSON.parse(JSON.stringify(breakpoints));

    console.log(uniqueId);
    console.log(breakpoints);


    const container = grid.querySelector(':scope > .wpbs-layout-grid__container');

    const cards = container.querySelectorAll('.wpbs-layout-grid-card');

    [...cards].forEach((card) => {
        card.classList.remove('last-row');
        card.classList.remove('first-row');
    });

    const columns = Number(getComputedStyle(grid).getPropertyValue('--columns').trim());

    const total = cards.length;

    const lastRowCount = total % columns || columns;

    const lastRowStartIndex = total - lastRowCount;

    const lastRowItems = Array.from(cards).slice(lastRowStartIndex);

    lastRowItems.forEach(item => item.classList.add('last-row'));

}

const {state} = store('wpbs/grid', {
    actions: {
        init: () => {

            const {ref: grid} = getElement();

            const {divider, breakpoints, uniqueId} = getContext();

            if (divider) {
                setDividers({grid, uniqueId, breakpoints});
            }


        },
        pagination: async () => {

            const {ref: element} = getElement();
            const {divider, breakpoints, uniqueId} = getContext();

            const grid = element.closest('.wpbs-layout-grid');
            const container = grid.querySelector(':scope > .wpbs-layout-grid__container');
            const page = parseInt(grid.dataset.page ? grid.dataset.page : 2);

            grid.dataset.page = String(page + 1);

            const data = JSON.parse(grid.querySelector('script.wpbs-layout-grid-args')?.innerHTML || '');

            const nonce = 'wpbsData' in window ? window.wpbsData?.nonce : false;

            await fetch('/wp-json/wpbs/v1/layout-grid', {
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
            }).then(response => response.json())
                .then(result => {

                    container.innerHTML += result.response;

                    if (divider) {
                        setDividers({grid, uniqueId, breakpoints});
                    }

                    if (!!result.last) {
                        element.remove();
                    }

                })
        }
    },
});