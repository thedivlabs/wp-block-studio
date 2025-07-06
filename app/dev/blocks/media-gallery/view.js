import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs/media-gallery', {
    actions: {
        init: () => {

            const {ref: grid} = getElement();
            const data = JSON.parse(grid.querySelector('script.wpbs-args')?.innerText ?? '{}');
            console.log(grid);
            const {is_last, is_slider} = data;

            const swiper_args = getContext();

            if (is_slider) {
                WPBS.slider.observe(grid, swiper_args);
            }

            WPBS.setMasonry(grid);

            WPBS.gridDividers(grid, data);

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
                        gallery_id: data?.gallery_id,
                    })

                });

            }


        },
        pagination: async () => {

            const {ref: element} = getElement();
            const parser = new DOMParser();

            const gallery = element.closest('.wpbs-media-gallery');
            const container = gallery.querySelector(':scope > .loop-container');
            const data = JSON.parse(gallery.querySelector('script.wpbs-args')?.textContent ?? '{}');

            const {card, gallery_id, video_first, page_size} = data;

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

                    WPBS.gridDividers(gallery, data);
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

            const context = JSON.parse(JSON.stringify(getContext()));
            const data = JSON.parse(block.closest('.wpbs-media-gallery').querySelector('script.wpbs-args')?.innerText ?? '{}');

            const {index = 0} = context;

            WPBS.lightbox.toggle({
                index: index,
                gallery_id: data?.gallery_id,
            })

        }
    },
});