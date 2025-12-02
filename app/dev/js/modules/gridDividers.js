export function     gridDividers(element, args = {}, uniqueId = false) {

    if (!element || !uniqueId) {
        return;
    }

    const {divider} = args;

    const colMobile = parseInt(args?.['columns-mobile'] ?? '1');
    const colSmall = parseInt(args?.['columns-small'] ?? '2');
    const colLarge = parseInt(args?.['columns-large'] ?? '3');

    const {breakpoints} = WPBS?.settings ?? {};

    const breakpointLarge = breakpoints[args?.['breakpoint-large'] ?? 'normal'];
    const breakpointSmall = breakpoints[args?.['breakpoint-small'] ?? 'sm'];

    if (!divider) {
        return;
    }

    const container = element.querySelector(':scope > .loop-container');


    const cards = container.querySelectorAll('.loop-card');

    const total = cards.length;

    console.log(container);
    console.log(cards);
    console.log(total);

    const selector = '.' + uniqueId;

    const lastRow = {
        mobile: {
            count: Math.floor(total - (Math.floor(total / colMobile) * colMobile)) || colMobile,
        },
        small: {
            count: Math.floor(total - (Math.floor(total / colSmall) * colSmall)) || colSmall,
        },
        large: {
            count: Math.floor(total - (Math.floor(total / colLarge) * colLarge)) || colLarge,
        }
    }

    const styleCss = [
        '@media screen and (max-width: calc(' + breakpointSmall + ' - 1px)) {',
        selector + ' .loop-container > .loop-card:nth-of-type( ' + colMobile + 'n+1 ):after { content: none !important; }',
        selector + ' .loop-container > .loop-card:nth-of-type( n+' + (colMobile + 1) + '):after { height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
        selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colMobile + 1) + ')) > .loop-card:before { content:"" }',
        selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colMobile + 1) + ')) > .loop-card:nth-of-type(-n+' + (colMobile + 1) + '):after { height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));top: 0; }',
        selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colMobile + 1) + ')) > .loop-card:nth-of-type(n+' + (colMobile + 2) + '):after { height: calc(100% + var(--grid-row-gap, var(--grid-col-gap, 0px)));top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
        selector + ' .loop-container > .loop-card:nth-of-type( ' + colMobile + 'n ):before { width: calc(100% + calc(var(--grid-col-gap) / 2)); }',
        selector + ' .loop-container > .loop-card:nth-of-type( ' + colMobile + 'n+1 ):before { width: ' + (colMobile > 1 ? 'calc(100% + calc(var(--grid-col-gap) / 2))' : '100%') + '; left: 0; }',
        selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colMobile + 1) + ')) > .loop-card:nth-last-of-type(-n+' + lastRow.mobile.count + '):after { height:calc(100% + calc(var(--grid-row-gap, var(--grid-col-gap)) / 2)) !important;top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
        selector + ' .loop-container > .loop-card:nth-last-of-type(-n+' + lastRow.mobile.count + '):before { content:none !important; }',
        '}',

        '@media screen and (min-width: ' + breakpointSmall + ') and (max-width: calc(' + breakpointLarge + ' - 1px)) {',
        selector + ' .loop-container > .loop-card:nth-of-type( ' + colSmall + 'n+1 ):after { content: none !important; }',
        selector + ' .loop-container > .loop-card:nth-of-type( n+' + (colSmall + 1) + '):after { height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
        selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colSmall + 1) + ')) > .loop-card:before { content:"" }',
        selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colSmall + 1) + ')) > .loop-card:nth-of-type(-n+' + (colSmall + 1) + '):after { height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));top: 0; }',
        selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colSmall + 1) + ')) > .loop-card:nth-of-type(n+' + (colSmall + 2) + '):after { height: calc(100% + var(--grid-row-gap, var(--grid-col-gap, 0px)));top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
        selector + ' .loop-container > .loop-card:nth-of-type( ' + colSmall + 'n ):before { width: calc(100% + calc(var(--grid-col-gap) / 2)); }',
        selector + ' .loop-container > .loop-card:nth-of-type( ' + colSmall + 'n+1 ):before { width: ' + (colSmall > 1 ? 'calc(100% + calc(var(--grid-col-gap) / 2))' : '100%') + '; left: 0; }',

        selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colSmall + 1) + ')) > .loop-card:nth-last-of-type(-n+' + lastRow.small.count + '):after { height:calc(100% + calc(var(--grid-row-gap, var(--grid-col-gap)) / 2)) !important;top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
        selector + ' .loop-container > .loop-card:nth-last-of-type(-n+' + lastRow.small.count + '):before { content:none !important; }',
        '}',

        '@media screen and (min-width: ' + breakpointLarge + ') {',
        selector + ' .loop-container > .loop-card:nth-of-type( ' + colLarge + 'n+1 ):after { content: none !important; }',
        selector + ' .loop-container > .loop-card:nth-of-type( n+' + (colLarge + 1) + '):after { height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
        selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colLarge + 1) + ')) > .loop-card:before { content:"" }',
        selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colLarge + 1) + ')) > .loop-card:nth-of-type(-n+' + (colLarge + 1) + '):after { height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));top: 0; }',
        selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colLarge + 1) + ')) > .loop-card:nth-of-type(n+' + (colLarge + 2) + '):after { height: calc(100% + var(--grid-row-gap, var(--grid-col-gap, 0px)));top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
        selector + ' .loop-container > .loop-card:nth-of-type( ' + colLarge + 'n ):before { width: calc(100% + calc(var(--grid-col-gap) / 2)); }',
        selector + ' .loop-container > .loop-card:nth-of-type( ' + colLarge + 'n+1 ):before { width: ' + (colLarge > 1 ? 'calc(100% + calc(var(--grid-col-gap) / 2))' : '100%') + '; left: 0; }',

        selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colLarge + 1) + ')) > .loop-card:nth-last-of-type(-n+' + lastRow.large.count + '):after { height:calc(100% + calc(var(--grid-row-gap, var(--grid-col-gap)) / 2)) !important;top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
        selector + ' .loop-container > .loop-card:nth-last-of-type(-n+' + lastRow.large.count + '):before { content:none !important; }',

        '}',
    ].join('\r\n');

    const styleTag = document.createElement('style');
    const styleSelector = [uniqueId, 'divider-styles'].join('-');


    [...document.querySelectorAll('.' + styleSelector)].forEach(tag => tag.remove());

    styleTag.classList.add(styleSelector);
    styleTag.textContent = styleCss;

    document.head.appendChild(styleTag);

    element.classList.add('--divider');

}
