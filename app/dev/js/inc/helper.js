export const SWIPER_OPTIONS_DEFAULT = {
    createElements: false,
    navigation: {
        enabled: true,
        nextEl: '.wpbs-slider-btn--next',
        prevEl: '.wpbs-slider-btn--prev',
    },
    pagination: {
        enabled: true,
        el: '.swiper-pagination',
    },
    watchSlidesProgress: true,
    updateOnWindowResize: true,
    simulateTouch: true,
    slidesPerView: 1,
    spaceBetween: 0,
    watchOverflow: true,
    passiveListeners: true,
    grabCursor: true,
    uniqueNavElements: true,
};


export const imageButtonStyle = {
    border: '1px dashed lightgray',
    width: '100%',
    height: 'auto',
    aspectRatio: '16/9',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
}

export function gridDividers(grid, context) {

    const {uniqueId, divider, columns} = context;

    const {breakpoints} = WPBS?.settings ?? {};

    const breakpointLarge = breakpoints[context?.breakpoints?.large ?? 'lg'];
    const breakpointSmall = breakpoints[context?.breakpoints?.small ?? 'sm'];

    if (!divider) {
        return false;
    }

    const container = grid.querySelector(':scope > .wpbs-layout-grid__container');

    const cards = container.querySelectorAll('.layout-grid-card');

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
        '@media screen and (width < ' + breakpointSmall + ') {',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colMobile + 'n+1 ):after { content: none !important; }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( n+' + (colMobile + 1) + '):after { height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colMobile + 1) + ')) > .wpbs-layout-grid-card:before { content:"" }',
        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colMobile + 1) + ')) > .wpbs-layout-grid-card:nth-of-type(-n+' + (colMobile + 1) + '):after { height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));top: 0; }',
        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colMobile + 1) + ')) > .wpbs-layout-grid-card:nth-of-type(n+' + (colMobile + 2) + '):after { height: calc(100% + var(--grid-row-gap, var(--grid-col-gap, 0px)));top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colMobile + 'n ):before { width: calc(100% + calc(var(--grid-col-gap) / 2)); }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colMobile + 'n+1 ):before { width: ' + (colMobile > 1 ? 'calc(100% + calc(var(--grid-col-gap) / 2))' : '100%') + '; left: 0; }',

        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colMobile + 1) + ')) > .wpbs-layout-grid-card:nth-last-of-type(-n+' + lastRow.mobile.count + '):after { height:calc(100% + calc(var(--grid-row-gap, var(--grid-col-gap)) / 2)) !important;top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type(-n+' + lastRow.mobile.count + '):before { content:none !important; }',
        '}',

        '@media screen and (min-width: ' + breakpointSmall + ') and (max-width: calc(' + breakpointLarge + ' - 1px)) {',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colSmall + 'n+1 ):after { content: none !important; }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( n+' + (colSmall + 1) + '):after { height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colSmall + 1) + ')) > .wpbs-layout-grid-card:before { content:"" }',
        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colSmall + 1) + ')) > .wpbs-layout-grid-card:nth-of-type(-n+' + (colSmall + 1) + '):after { height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));top: 0; }',
        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colSmall + 1) + ')) > .wpbs-layout-grid-card:nth-of-type(n+' + (colSmall + 2) + '):after { height: calc(100% + var(--grid-row-gap, var(--grid-col-gap, 0px)));top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colSmall + 'n ):before { width: calc(100% + calc(var(--grid-col-gap) / 2)); }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colSmall + 'n+1 ):before { width: ' + (colSmall > 1 ? 'calc(100% + calc(var(--grid-col-gap) / 2))' : '100%') + '; left: 0; }',

        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type(-n+' + lastRow.small.count + '):after { height:calc(100% + calc(var(--grid-row-gap, var(--grid-col-gap)) / 2)) !important;top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-last-of-type(-n+' + lastRow.small.count + '):before { content:none !important; }',
        '}',

        '@media screen and (width > ' + breakpointLarge + ') {',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colLarge + 'n+1 ):after { content: none !important; }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( n+' + (colLarge + 1) + '):after { height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colLarge + 1) + ')) > .wpbs-layout-grid-card:before { content:"" }',
        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colLarge + 1) + ')) > .wpbs-layout-grid-card:nth-of-type(-n+' + (colLarge + 1) + '):after { height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));top: 0; }',
        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colLarge + 1) + ')) > .wpbs-layout-grid-card:nth-of-type(n+' + (colLarge + 2) + '):after { height: calc(100% + var(--grid-row-gap, var(--grid-col-gap, 0px)));top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colLarge + 'n ):before { width: calc(100% + calc(var(--grid-col-gap) / 2)); }',
        selector + ' > .wpbs-layout-grid__container > .wpbs-layout-grid-card:nth-of-type( ' + colLarge + 'n+1 ):before { width: ' + (colLarge > 1 ? 'calc(100% + calc(var(--grid-col-gap) / 2))' : '100%') + '; left: 0; }',

        selector + ' > .wpbs-layout-grid__container:has(> div:nth-of-type(' + (colLarge + 1) + ')) > .wpbs-layout-grid-card:nth-last-of-type(-n+' + lastRow.large.count + '):after { height:calc(100% + calc(var(--grid-row-gap, var(--grid-col-gap)) / 2)) !important;top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
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

export function setMasonry(grid) {

    if (!'Masonry' in window) {
        return;
    }

    if (grid && grid.classList.contains('wpbs-layout-grid--masonry')) {

        const container = grid.querySelector(':scope > .wpbs-layout-grid__container');
        const masonryData = Masonry.data(container) || false;
        const gutterSizer = container.querySelector(':scope > .gutter-sizer');
        if (masonryData) {
            masonryData.destroy();
        }

        const masonry = new Masonry(container, {
            itemSelector: '.wpbs-layout-grid-card',
            //columnWidth: '.wpbs-layout-grid-card',
            gutter: gutterSizer,
            percentPosition: true,
            horizontalOrder: true,
        });
        masonry.layout();

    }
}