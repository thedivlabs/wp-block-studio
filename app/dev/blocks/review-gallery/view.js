import {getContext, getElement, store} from '@wordpress/interactivity';

async function fetchGallery(data = {}) {

    //const endpoint = '/wp-json/wp/v2/block-renderer/wpbs/review-gallery-container';
    const endpoint = '/wp-json/wpbs/v1/review-gallery';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': WPBS?.settings?.nonce_rest ?? '',
            },
            body: JSON.stringify({
                ...data,
            }),
        });

        return await response.json();

    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

const {state} = store('wpbs/review-gallery', {
    actions: {
        init: () => {

            const {ref: element} = getElement();
            const container = element.querySelector(':scope > .wpbs-review-gallery-container');
            const args = JSON.parse(element.querySelector('script.wpbs-review-gallery-args')?.textContent ?? '{}');

            const {settings} = args;
            const {gallery, slider: swiper_args, type, uniqueId, grid} = settings;

            if (!uniqueId) {
                return;
            }

            const is_slider = type === 'slider';

            if (!!is_slider && swiper_args) {
                WPBS.slider.observe(element, swiper_args);
            }

            if (!is_slider) {
                WPBS.setMasonry(container);

                WPBS.gridDividers(element, grid, settings?.uniqueId);
            }

            if (element.classList.contains('--last-page')) {
                [...element.querySelectorAll(':scope > .wpbs-pagination-button')].forEach(button => button.remove());
            }

            element.addEventListener('click', (event) => {


                if (element.classList.contains('--lightbox')) {

                    const card = event.target.closest('.wpbs-review-gallery-card');

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

            const element = button.closest('.wpbs-review-gallery');
            const container = element ? element.querySelector(':scope > .wpbs-review-gallery-container') : false;

            const args = element ? JSON.parse(element.querySelector('script.wpbs-review-gallery-args')?.textContent ?? '{}') : false;

            if (!args) {
                return false;
            }

            const page = parseInt(element.dataset?.page ?? 1);
            const next_page = page + 1;

            const {settings, card} = args;

            const {grid = {}, uniqueId} = settings;

            const request = {
                uniqueId: uniqueId,
                blockContext: {
                    'wpbs/interactive': true,
                    'wpbs/page': next_page,
                    'wpbs/settings': settings,
                    'wpbs/card': card
                }
            };

            WPBS.loader.toggle();

            fetchGallery(request).then((result) => {

                WPBS.loader.toggle({
                    remove: true
                });

                const parser = new DOMParser();

                element.dataset.page = String(next_page);

                if (!result?.rendered) {
                    return false;
                }

                const grid_container = parser.parseFromString(result?.rendered ?? '', 'text/html').querySelector('.wpbs-review-gallery-container');
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

                WPBS.observeMedia(container);

            })
        },
    },
});