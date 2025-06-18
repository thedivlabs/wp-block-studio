import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs/media-gallery', {
    actions: {
        init: () => {

            const {ref: grid} = getElement();
            const context = JSON.parse(JSON.stringify(getContext()));
            const scriptTag = grid.querySelector('script.wpbs-media-gallery-args');
            const {cur, max} = scriptTag?.innerHTML ? JSON.parse(scriptTag?.innerHTML ?? '') : {};

            WPBS.setMasonry(grid);

            WPBS.gridDividers(grid, context);

            [...grid.querySelectorAll('.wpbs-media-gallery__button')].forEach((el) => {
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
            const parser = new DOMParser();

            const grid = element.closest('.wpbs-media-gallery');
            const container = grid.querySelector(':scope > .wpbs-media-gallery__container');
            const page = parseInt(grid.dataset?.page ?? 2);

            const isGallery = grid.classList.contains('is-style-gallery');

            grid.dataset.page = String(page + 1);

            const scriptTag = grid.querySelector('script.wpbs-media-gallery-args');

            const data = scriptTag?.innerHTML ? JSON.parse(scriptTag?.innerHTML ?? '') : {};

            const endpoint = '/wp-json/wpbs/v1/media-gallery';

            const request = {
                card: data.card,
                attrs: data.attrs,
                page: page
            };

            WPBS.loader.toggle();

            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': WPBS?.settings?.nonce ?? false,
                },
                body: JSON.stringify(request),
            }).then(response => response.json())
                .then(result => {

                    WPBS.loader.toggle({
                        remove: true
                    });

                    const newNodes = parser.parseFromString(result.response, 'text/html');
                    container.append(...newNodes.body.childNodes);

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