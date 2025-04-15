import {store, getElement, getContext} from '@wordpress/interactivity';

function setDividers(grid, context) {

    const {uniqueId, divider, breakpoints, columns} = context;

    if (!divider) {
        return false;
    }

    const container = grid.querySelector(':scope > .wpbs-layout-grid__container');

    const cards = container.querySelectorAll('.wpbs-layout-grid-card');

    const total = cards.length;

    const selector = '.' + uniqueId;

    const {
        mobile: colMobile = 1,
        small: colSmall = 2,
        large: colLarge = 3,
    } = Object.fromEntries(
        Object.entries(columns).map(([key, value]) => [key, Number(value)])
    );

    const lastRow = {
        mobile: {
            count: total % colMobile || colMobile,
            index: total - (total % colMobile || colMobile)
        },
        small: {
            count: total % colSmall || colSmall,
            index: total - (total % colSmall || colSmall)
        },
        large: {
            count: total % colLarge || colLarge,
            index: total - (total % colLarge || colLarge)
        }
    }

    const styleCss = [
        '@media screen and (max-width: calc(' + breakpoints.small + ' - 1px)) {',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colMobile + 'n+1 ):after { content: none !important; }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( n+' + (colMobile + 1) + '):after { height: calc(100% + (var(--row-gap, var(--column-gap)) / 2));top: calc(0px - (var(--row-gap, var(--column-gap, 0px)) / 2)); }',
        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colMobile + 1) + ')) > .wpbs-layout-grid-card:before { content:"" }',
        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colMobile + 1) + ')) > .wpbs-layout-grid-card:nth-of-type(-n+' + (colMobile + 1) + '):after { height: calc(100% + (var(--row-gap, var(--column-gap)) / 2));top: 0; }',
        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colMobile + 1) + ')) > .wpbs-layout-grid-card:nth-of-type(n+' + (colMobile + 2) + '):after { height: calc(100% + var(--row-gap, var(--column-gap, 0px)));top: calc(0px - (var(--row-gap, var(--column-gap, 0px)) / 2)); }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colMobile + 'n ):before { width: calc(100% + calc(var(--column-gap) / 2)); }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colMobile + 'n+1 ):before { width: ' + (colMobile > 1 ? 'calc(100% + calc(var(--column-gap) / 2))' : '100%') + '; left: 0; }',

        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colMobile + 1) + ')) > .wpbs-layout-grid-card:nth-last-of-type(-n+' + lastRow.mobile.count + '):after { height:calc(100% + calc(var(--row-gap, var(--column-gap)) / 2)) !important;top: calc(0px - (var(--row-gap, var(--column-gap, 0px)) / 2)); }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type(-n+' + lastRow.mobile.count + '):before { content:none !important; }',
        '}',

        '@media screen and (min-width: ' + breakpoints.small + ') and (max-width: calc(' + breakpoints.large + ' - 1px)) {',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colSmall + 'n+1 ):after { content: none !important; }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( n+' + (colSmall + 1) + '):after { height: calc(100% + (var(--row-gap, var(--column-gap)) / 2));top: calc(0px - (var(--row-gap, var(--column-gap, 0px)) / 2)); }',
        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colSmall + 1) + ')) > .wpbs-layout-grid-card:before { content:"" }',
        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colSmall + 1) + ')) > .wpbs-layout-grid-card:nth-of-type(-n+' + (colSmall + 1) + '):after { height: calc(100% + (var(--row-gap, var(--column-gap)) / 2));top: 0; }',
        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colSmall + 1) + ')) > .wpbs-layout-grid-card:nth-of-type(n+' + (colSmall + 2) + '):after { height: calc(100% + var(--row-gap, var(--column-gap, 0px)));top: calc(0px - (var(--row-gap, var(--column-gap, 0px)) / 2)); }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colSmall + 'n ):before { width: calc(100% + calc(var(--column-gap) / 2)); }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colSmall + 'n+1 ):before { width: ' + (colSmall > 1 ? 'calc(100% + calc(var(--column-gap) / 2))' : '100%') + '; left: 0; }',

        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type(-n+' + lastRow.small.count + '):after { height:calc(100% + calc(var(--row-gap, var(--column-gap)) / 2)) !important;top: calc(0px - (var(--row-gap, var(--column-gap, 0px)) / 2)); }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type(-n+' + lastRow.small.count + '):before { content:none !important; }',
        '}',

        '@media screen and (min-width: ' + breakpoints.large + ') {',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colLarge + 'n+1 ):after { content: none !important; }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( n+' + (colLarge + 1) + '):after { height: calc(100% + (var(--row-gap, var(--column-gap)) / 2));top: calc(0px - (var(--row-gap, var(--column-gap, 0px)) / 2)); }',
        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colLarge + 1) + ')) > .wpbs-layout-grid-card:before { content:"" }',
        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colLarge + 1) + ')) > .wpbs-layout-grid-card:nth-of-type(-n+' + (colLarge + 1) + '):after { height: calc(100% + (var(--row-gap, var(--column-gap)) / 2));top: 0; }',
        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colLarge + 1) + ')) > .wpbs-layout-grid-card:nth-of-type(n+' + (colLarge + 2) + '):after { height: calc(100% + var(--row-gap, var(--column-gap, 0px)));top: calc(0px - (var(--row-gap, var(--column-gap, 0px)) / 2)); }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colLarge + 'n ):before { width: calc(100% + calc(var(--column-gap) / 2)); }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colLarge + 'n+1 ):before { width: ' + (colLarge > 1 ? 'calc(100% + calc(var(--column-gap) / 2))' : '100%') + '; left: 0; }',

        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colLarge + 1) + ')) > .wpbs-layout-grid-card:nth-last-of-type(-n+' + lastRow.large.count + '):after { height:calc(100% + calc(var(--row-gap, var(--column-gap)) / 2)) !important;top: calc(0px - (var(--row-gap, var(--column-gap, 0px)) / 2)); }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type(-n+' + lastRow.large.count + '):before { content:none !important; }',
        '}',
    ].join('\r\n');

    const styleTag = document.createElement('style');
    const styleSelector = [uniqueId, 'divider-styles'].join('-');

    styleTag.classList.add(styleSelector);
    styleTag.innerHTML = styleCss;

    document.head.querySelector('.' + styleSelector)?.remove();

    document.head.appendChild(styleTag);

    grid.classList.add('wpbs-layout-grid--divider');

}

const {state} = store('wpbs/grid', {
    actions: {
        init: () => {

            const {ref: grid} = getElement();

            const context = JSON.parse(JSON.stringify(getContext()));

            setDividers(grid, context);


        },
        pagination: async () => {

            const {ref: element} = getElement();
            const context = JSON.parse(JSON.stringify(getContext()));

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

                    setDividers(grid, context);

                    if (!!result.last) {
                        element.remove();
                    }

                })
        }
    },
});