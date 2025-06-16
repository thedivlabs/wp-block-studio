import {store, getElement, getContext} from '@wordpress/interactivity';

function setDividers(grid, context) {

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

function setMasonry(grid) {

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

const {state} = store('wpbs/grid', {
    actions: {
        init: () => {

            const {ref: grid} = getElement();
            const context = JSON.parse(JSON.stringify(getContext()));
            const scriptTag = grid.querySelector('script.wpbs-layout-grid-args');
            const {cur, max} = scriptTag?.innerHTML ? JSON.parse(scriptTag?.innerHTML ?? '') : {};

            setMasonry(grid);
            setDividers(grid, context);

            [...grid.querySelectorAll('.wpbs-layout-grid__button')].forEach((el) => {
                if (cur >= max) {
                    el.remove();
                } else {
                    el.classList.remove('hidden');
                }
            })


        },
        pagination: async () => {

            const {ref: element} = getElement();
            const context = JSON.parse(JSON.stringify(getContext()));

            const grid = element.closest('.wpbs-layout-grid');
            const container = grid.querySelector(':scope > .wpbs-layout-grid__container');
            const page = parseInt(grid.dataset?.page ?? 2);

            const isGallery = grid.classList.contains('is-style-gallery');

            console.log(isGallery);

            grid.dataset.page = String(page + 1);

            const scriptTag = grid.querySelector('script.wpbs-layout-grid-args');

            const data = scriptTag?.innerHTML ? JSON.parse(scriptTag?.innerHTML ?? '') : {};

            const nonce = WPBS?.settings?.nonce ?? false;

            const endpoint = isGallery ? '/wp-json/wpbs/v1/media-gallery'
                : '/wp-json/wpbs/v1/layout-grid';

            const request = isGallery ? {
                card: data.card,
                attrs: data.attrs,
                page: page,
                galleryId: data?.['gallery-id'],
            } : {
                card: data.card,
                attrs: data.attrs,
                page: page,
                query: data.query,
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

                    container.innerHTML += result.response;

                    setDividers(grid, context);
                    setMasonry(grid);

                    const media = grid.querySelectorAll('img[data-src],picture:has(source[data-src]),video:has(source[data-src]),video:has(source[data-media]),.wpbs-background');
                    [...media].forEach((media_element) => {
                        WPBS.observeMedia(media_element);
                    })

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