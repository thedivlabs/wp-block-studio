import {getContext, getElement, store} from '@wordpress/interactivity';

async function fetchGallery(data = {}) {
    const endpoint = '/wp-json/wp/v2/block-renderer/wpbs/media-gallery-container';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': WPBS?.settings?.nonce ?? '',
            },
            body: JSON.stringify({
                ...data,
                context: 'edit'
            }),
        });

        return await response.json();

    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

const {state} = store('wpbs/media-gallery', {
    actions: {
        init: () => {

            const {ref: element} = getElement();
            const container = element.querySelector(':scope > .wpbs-media-gallery-container');
            const args = JSON.parse(element.querySelector('script.wpbs-media-gallery-args')?.textContent ?? '{}');

            const {gallery, slider: swiper_args, grid, uniqueId} = args;

            if (!uniqueId) {
                return;
            }

            const is_slider = gallery?.type === 'slider';

            if (!!is_slider && swiper_args) {
                WPBS.slider.observe(element, swiper_args);
            }

            if (!is_slider) {
                WPBS.setMasonry(container);

                WPBS.gridDividers(element, grid, uniqueId);
            }

            if (element.classList.contains('--last-page')) {
                [...element.querySelectorAll(':scope > .wpbs-pagination-button')].forEach(button => button.remove());
            }

            element.addEventListener('click', (event) => {


                if (element.classList.contains('--lightbox')) {

                    const card = event.target.closest('.wpbs-media-gallery-card');

                    if (!card) {
                        return;
                    }

                    WPBS.lightbox.toggle({
                        index: card.dataset.index || 1,
                        media: args?.media,
                    }).then(() => {

                    })
                }
            }, {
                passive: true,
            });


        },
        pagination: (event) => {

            event.preventDefault();

            const {ref: button} = getElement();

            const element = button.closest('.wpbs-media-gallery');
            const container = element ? element.querySelector(':scope > .wpbs-media-gallery-container') : false;

            const args = element ? JSON.parse(element.querySelector('script.wpbs-media-gallery-args')?.textContent ?? '{}') : false;

            if (!args) {
                return false;
            }

            const page = parseInt(element.dataset?.page ?? 1);
            const next_page = page + 1;

            const {settings, grid, uniqueId, card} = args;

            const request = {
                attributes: {
                    uniqueId: uniqueId,
                    context: {
                        'wpbs/interactive': true,
                        'wpbs/page': next_page,
                        'wpbs/settings': settings,
                        'wpbs/card': card
                    }
                }
            };

            WPBS.loader.toggle();

            fetchGallery(request).then((result) => {

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

                if (!!grid?.masonry) {
                    WPBS.setMasonry(container);
                }

                [...container.querySelectorAll('[data-src],[data-srcset]')].forEach((el) => WPBS.observeMedia(el));

            })
        },
    },
});