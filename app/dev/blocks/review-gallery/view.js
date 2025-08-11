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

            const context = getContext();

            const {slider: swiper_args} = context;

            if (!swiper_args) {
                return;
            }
            
            WPBS.slider.observe(element, swiper_args);


        },
    },
});