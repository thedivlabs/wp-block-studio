import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs/media-gallery', {
    actions: {
        init: () => {

            const {ref: grid} = getElement();
            const context = getContext();

            const {settings, slider: swiper_args} = context;

            const {is_last, gallery_id} = settings;

            if (!!settings?.is_slider) {
                WPBS.slider.observe(grid, swiper_args);
            }

            WPBS.setMasonry(grid);

            WPBS.gridDividers(grid, context?.grid ?? {});


            grid.addEventListener('click', (event) => {


                if (grid.classList.contains('--lightbox')) {
                    const card = event.target.closest('.wpbs-lightbox-card');

                    if (card) {
                        return WPBS.lightbox.toggle({
                            index: card.dataset.index,
                            gallery_id: gallery_id,
                        })
                    }
                }
            });


        },
        pagination: async (event) => {

            event.preventDefault();

            const {ref: element} = getElement();
            const parser = new DOMParser();

            const gallery = element.closest('.wpbs-media-gallery');
            const container = gallery.querySelector(':scope > .loop-container');
            const context = getContext();

            const scriptElement = gallery.querySelector('script.wpbs-media-gallery-args');
            const card = scriptElement ? JSON.parse(scriptElement.textContent)?.card ?? false : false;

            gallery.dataset.page = String(parseInt(gallery.dataset?.page ?? 1) + 1);

            const nonce = WPBS?.settings?.nonce ?? false;

            const endpoint = '/wp-json/wpbs/v1/media-gallery';

            const request = {
                ...context?.settings ?? {},
                page_number: gallery.dataset.page,
                card: card,
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
                        // return;
                    }

                    const newNodes = parser.parseFromString(content, 'text/html');

                    if (newNodes) {
                        container.append(...newNodes.body.childNodes);
                    }

                    WPBS.gridDividers(gallery, context);
                    WPBS.setMasonry(gallery);

                    [...gallery.querySelectorAll('[data-src],[data-srcset]')].forEach((el) => WPBS.observeMedia(el));

                    if (css) {
                        const styleTag = document.createElement('style');
                        styleTag.innerHTML = css;
                        document.head.appendChild(styleTag);
                    }


                })
        },
    },
});