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


        },
    },
});