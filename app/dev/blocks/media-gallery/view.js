import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs/media-gallery', {
    callbacks: {
        init: () => {

            const {ref: grid} = getElement();
            const context = getContext();

            const {settings, slider: swiper_args} = context;

            if (!!settings?.is_slider) {
                WPBS.slider.observe(grid, swiper_args);
            }

            WPBS.setMasonry(grid);

            WPBS.gridDividers(grid, context?.grid);

            [...grid.querySelectorAll('.loop-button')].forEach((el) => {
                if (!is_last) {
                    el.classList.remove('hidden');
                } else {
                    el.remove();
                }
            });

            if (grid.classList.contains('--lightbox')) {
                grid.addEventListener('click', (event) => {
                    const card = event.target.closest('.wpbs-lightbox-card');

                    if (!card) {
                        return false;
                    }

                    WPBS.lightbox.toggle({
                        index: card.dataset.index,
                        gallery_id: gallery_id,
                    })

                });

            }


        },
        pagination: async () => {

            const {ref: element} = getElement();
            const parser = new DOMParser();

            const gallery = element.closest('.wpbs-media-gallery');
            const container = gallery.querySelector(':scope > .loop-container');
            const context = getContext();

            const {card, gallery_id, video_first, page_size} = context;

            gallery.dataset.page = String(parseInt(gallery.dataset?.page ?? 1) + 1);

            const nonce = WPBS?.settings?.nonce ?? false;

            const endpoint = '/wp-json/wpbs/v1/media-gallery';

            const request = {
                gallery_id: gallery_id,
                video_first: !!video_first,
                page_number: gallery.dataset.page,
                page_size: page_size,
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
        lightbox: () => {
            const {ref: block} = getElement();

            const context = getContext();
            const {gallery_id} = context;

            const {index = 0} = context;

            WPBS.lightbox.toggle({
                index: index,
                gallery_id: gallery_id,
            })

        }
    },
});