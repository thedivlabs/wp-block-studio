import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs/media-gallery', {
    actions: {
        init: () => {

            const {ref: element} = getElement();
            const context = getContext();
            const container = element.querySelector(':scope > .wpbs-media-gallery-container');

            const {gallery, slider: swiper_args, grid, uniqueId} = context;

            if (!uniqueId) {
                return;
            }
            
            const is_slider = context?.type === 'slider';

            if (!!is_slider) {
                WPBS.slider.observe(element, swiper_args);
            }

            if (!is_slider) {
                WPBS.setMasonry(container);

                WPBS.gridDividers(element, grid, uniqueId);
            }


            element.addEventListener('click', (event) => {

                if (element.classList.contains('--lightbox')) {
                    const card = event.target.closest('.loop-card');

                    if (card) {
                        return WPBS.lightbox.toggle({
                            index: card.dataset.index,
                            context: context,
                        })
                    }
                }
            }, {
                once: true,
                passive: true,
            });


        },
        pagination: async (event) => {

            event.preventDefault();

            const {ref: button} = getElement();

            const element = button.closest('.wpbs-media-gallery');
            const container = element.querySelector(':scope > .wpbs-media-gallery-container');
            const context = getContext();

            const args = JSON.parse(element.querySelector('script.wpbs-media-gallery-args')?.textContent ?? '{}');
            const {card} = args;
            const page = parseInt(element.dataset?.page ?? 1);
            const next_page = page + 1;

            const {gallery, grid, slider, type, uniqueId} = context;

            const nonce = WPBS?.settings?.nonce ?? false;

            const endpoint = '/wp-json/wp/v2/block-renderer/wpbs/media-gallery-container';

            const request = {
                attributes: {
                    uniqueId: uniqueId,
                    context: {
                        'wpbs/interactive': true,
                        'wpbs/page': next_page,
                        'wpbs/settings': context,
                        'wpbs/card': card
                    }
                },
                context: 'edit',
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

                    const parser = new DOMParser();

                    element.dataset.page = String(next_page);


                    const grid_container = parser.parseFromString(result?.rendered ?? '', 'text/html').querySelector('.wpbs-media-gallery-container');
                    const grid_cards = grid_container.querySelectorAll('.loop-card');
                    const is_last = grid_container.classList.contains('--last-page');

                    if (is_last) {
                        button.remove();
                    }

                    if (grid_cards) {

                        [...grid_cards].forEach(node => {
                            container.append(node);
                        })

                    }

                    WPBS.gridDividers(element, grid, uniqueId);

                    if (!!gallery?.masonry) {
                        WPBS.setMasonry(container);
                    }

                    [...container.querySelectorAll('[data-src],[data-srcset]')].forEach((el) => WPBS.observeMedia(el));

                })
        },
    },
});