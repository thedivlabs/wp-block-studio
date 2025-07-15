import {store, getElement, getContext} from '@wordpress/interactivity';

async function fetchGallery(data = {}, callback) {
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

        const result = await response.json();

        if (typeof callback === 'function') {
            callback(result);
        }

        return result;

    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

async function lightbox(element, template, settings, uniqueId) {

    if (!element || !template || !settings || !uniqueId) {
        return
    }

    const request = {
        attributes: {
            context: {
                'wpbs/lightbox': {
                    uniqueId: uniqueId,
                    template: template,
                    ...settings
                },
            }
        }
    };

    console.log(request);

    const gallery = fetchGallery(request, (result) => {
        WPBS.loader.toggle({
            remove: true
        });

        console.log(result);

        const parser = new DOMParser();
        const gallery_container = parser.parseFromString(result?.rendered ?? '', 'text/html');
        const gallery_cards = [...gallery_container.querySelectorAll('body > div')].map((el)=>{
            return el.querySelector(':scope > :first-child');
        });

        console.log(gallery_container);
        console.log(gallery_cards);

        WPBS.lightbox.toggle({
            index: element.dataset.index,
            cards: gallery_cards,
        })

        return result;
    })

    return await gallery;

}

const {state} = store('wpbs/media-gallery', {
    actions: {
        init: () => {

            const {ref: element} = getElement();
            const context = getContext();
            const container = element.querySelector(':scope > .wpbs-media-gallery-container');
            const args = JSON.parse(element.querySelector('script.wpbs-media-gallery-args')?.textContent ?? '{}');
            const {card: card_template} = args;

            const {gallery, slider: swiper_args, grid, uniqueId} = context;

            if (!uniqueId) {
                return;
            }

            const is_slider = context?.type === 'slider';

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


            element.addEventListener('click', async (event) => {

                if (element.classList.contains('--lightbox')) {
                    lightbox(event.target, card_template, gallery, uniqueId).then((result) => {
                        console.log(result)
                    })
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

            const request = {
                attributes: {
                    uniqueId: uniqueId,
                    context: {
                        'wpbs/interactive': true,
                        'wpbs/page': next_page,
                        'wpbs/settings': context,
                        'wpbs/card': card
                    }
                }
            };

            WPBS.loader.toggle();

            await fetchGallery(request, (result) => {
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