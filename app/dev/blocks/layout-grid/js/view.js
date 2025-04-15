import {store, getElement, getContext} from '@wordpress/interactivity';

function setDividers(grid, context) {

    const {uniqueId, divider, breakpoints, columns} = context;

    if (!divider) {
        return false;
    }

    const selector = '.' + uniqueId;
    const styleSelector = [uniqueId, 'divider-styles'].join('-');

    const styleTag = document.createElement('style');
    document.head.appendChild(styleTag);


    let styleCss = '';

    const {
        mobile: colMobile = 1,
        small: colSmall = 2,
        large: colLarge = 3,
    } = Object.fromEntries(
        Object.entries(columns).map(([key, value]) => [key, Number(value)])
    );

    styleTag.classList.add(styleSelector);

    styleCss += '@media screen and (max-width: calc(' + breakpoints.mobile + ' - 1px)) {' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colMobile + 'n+1 ):after { content: none !important; }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( n+' + (colMobile + 1) + '):after { height: calc(100% + (var(--row-gap, var(--column-gap)) / 2));top: calc(0px - (var(--row-gap, var(--column-gap, 0px)) / 2)); }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colMobile + 1) + ')) > .wpbs-layout-grid-card:before { content:"" }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colMobile + 1) + ')) > .wpbs-layout-grid-card:nth-of-type(-n+' + (colMobile + 1) + '):after { height: calc(100% + (var(--row-gap, var(--column-gap)) / 2));top: 0; }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colMobile + 1) + ')) > .wpbs-layout-grid-card:nth-of-type(n+' + (colMobile + 2) + '):after { height: calc(100% + var(--row-gap, var(--column-gap, 0px)));top: calc(0px - (var(--row-gap, var(--column-gap, 0px)) / 2)); }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colMobile + 1) + ')) > .wpbs-layout-grid-card.last-row:not(:nth-of-type(-n+' + colMobile + ')):after { height:calc(100% + calc(var(--row-gap, var(--column-gap)) / 2)) !important;top: calc(0px - (var(--row-gap, var(--column-gap, 0px)) / 2)); }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colMobile + 'n ):before { width: calc(100% + calc(var(--column-gap) / 2)); }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colMobile + 'n+1 ):before { width: ' + (colMobile > 1 ? 'calc(100% + calc(var(--column-gap) / 2))' : '100%') + '; left: 0; }' + '\r\n';
    styleCss += '}';

    styleCss += '@media screen and (min-width: ' + breakpoints.small + ') and (max-width: calc(' + breakpoints.small + ' - 1px)) {';
    styleCss += selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colSmall + 'n+1 ):after { content: none !important; }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( n+' + (colSmall + 1) + '):after { height: calc(100% + (var(--row-gap, var(--column-gap)) / 2));top: calc(0px - (var(--row-gap, var(--column-gap, 0px)) / 2)); }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colSmall + 1) + ')) > .wpbs-layout-grid-card:before { content:"" }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colSmall + 1) + ')) > .wpbs-layout-grid-card:nth-of-type(-n+' + (colSmall + 1) + '):after { height: calc(100% + (var(--row-gap, var(--column-gap)) / 2));top: 0; }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colSmall + 1) + ')) > .wpbs-layout-grid-card:nth-of-type(n+' + (colSmall + 2) + '):after { height: calc(100% + var(--row-gap, var(--column-gap, 0px)));top: calc(0px - (var(--row-gap, var(--column-gap, 0px)) / 2)); }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colSmall + 1) + ')) > .wpbs-layout-grid-card.last-row:not(:nth-of-type(-n+' + colSmall + ')):after { height:calc(100% + calc(var(--row-gap, var(--column-gap)) / 2)) !important;top: calc(0px - (var(--row-gap, var(--column-gap, 0px)) / 2)); }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colSmall + 'n ):before { width: calc(100% + calc(var(--column-gap) / 2)); }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colSmall + 'n+1 ):before { width: ' + (colSmall > 1 ? 'calc(100% + calc(var(--column-gap) / 2))' : '100%') + '; left: 0; }' + '\r\n';
    styleCss += '}';

    styleCss += '@media screen and (min-width: ' + breakpoints.large + ') {';
    styleCss += selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colLarge + 'n+1 ):after { content: none !important; }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( n+' + (colLarge + 1) + '):after { height: calc(100% + (var(--row-gap, var(--column-gap)) / 2));top: calc(0px - (var(--row-gap, var(--column-gap, 0px)) / 2)); }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colLarge + 1) + ')) > .wpbs-layout-grid-card:before { content:"" }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colLarge + 1) + ')) > .wpbs-layout-grid-card:nth-of-type(-n+' + (colLarge + 1) + '):after { height: calc(100% + (var(--row-gap, var(--column-gap)) / 2));top: 0; }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colLarge + 1) + ')) > .wpbs-layout-grid-card:nth-of-type(n+' + (colLarge + 2) + '):after { height: calc(100% + var(--row-gap, var(--column-gap, 0px)));top: calc(0px - (var(--row-gap, var(--column-gap, 0px)) / 2)); }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colLarge + 1) + ')) > .wpbs-layout-grid-card.last-row:not(:nth-of-type(-n+' + colLarge + ')):after { height:calc(100% + calc(var(--row-gap, var(--column-gap)) / 2)) !important;top: calc(0px - (var(--row-gap, var(--column-gap, 0px)) / 2)); }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colLarge + 'n ):before { width: calc(100% + calc(var(--column-gap) / 2)); }' + '\r\n';
    styleCss += selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colLarge + 'n+1 ):before { width: ' + (colLarge > 1 ? 'calc(100% + calc(var(--column-gap) / 2))' : '100%') + '; left: 0; }' + '\r\n';
    styleCss += '}';

    styleTag.innerHTML = styleCss;

    document.head.querySelector('.' + styleSelector).remove();

    document.head.appendChild(styleTag);

    const container = grid.querySelector(':scope > .wpbs-layout-grid__container');

    const cards = container.querySelectorAll('.wpbs-layout-grid-card');

    [...cards].forEach((card) => {
        card.classList.remove('last-row');
        card.classList.remove('first-row');
    });

    const currentColumns = Number(getComputedStyle(grid).getPropertyValue('--columns').trim());

    const total = cards.length;

    const lastRowCount = total % currentColumns || currentColumns;

    const lastRowStartIndex = total - lastRowCount;

    const lastRowItems = Array.from(cards).slice(lastRowStartIndex);

    lastRowItems.forEach(item => item.classList.add('last-row'));

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