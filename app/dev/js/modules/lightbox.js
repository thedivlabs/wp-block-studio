import {SWIPER_ARGS_VIEW} from "Includes/config";

export default class Lightbox {

    static class_name = 'wpbs-lightbox';

    static swiper_args = (index = 0) => ({
        ...SWIPER_ARGS_VIEW,
        initialSlide: index,
        spaceBetween: 10,
        slidesPerView: 1,
        simulateTouch: true,
        zoom: {
            toggle: true,
            limitToOriginalSize: true,
            maxRatio: 8,
            containerClass: 'swiper-zoom-container',
        },
    });

    static init() {
        // Delegated listener so it works for dynamically-rendered content
        document.addEventListener('click', (event) => {

            const isLightbox = event.target.closest('.wpbs-lightbox');

            if (isLightbox !== null) {
                return;
            }

            // Find ANY element marked with data-index
            const indexed = event.target.closest('[data-index]');
            if (!indexed) return;

            // That element must live inside a lightbox wrapper
            const wrapper = indexed.closest('[data-lightbox]');
            if (!wrapper) return;

            // Parse JSON payload
            const raw = wrapper.getAttribute('data-lightbox');
            if (!raw) return;

            let payload;
            try {
                payload = JSON.parse(raw);
            } catch (e) {
                console.error('WPBS Lightbox: invalid JSON in data-lightbox', e);
                return;
            }

            const media = Array.isArray(payload?.media) ? payload.media : [];
            if (!media.length) return;

            const index = Number.parseInt(indexed.dataset.index, 10) || 0;

            this.toggle({
                index,
                media,
                settings: payload.settings || {},
            });
        }, {passive: true});
    }


    static async toggle(args = {}) {
        const endpoint = '/wp-json/wpbs/v1/lightbox';


        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': WPBS?.settings?.nonce_rest ?? '',
            },
            body: JSON.stringify({
                media: args.media,
                index: args.index ?? 0,
                settings: args.settings ?? {},
            }),
        })
            .then(response => response.json())
            .then(result => {


                const parser = new DOMParser();
                const lightbox_element = parser
                    .parseFromString(result?.rendered ?? '', 'text/html')
                    .querySelector('.wpbs-lightbox');

                if (!lightbox_element) {
                    console.error('WPBS Lightbox: no .wpbs-lightbox element in response');
                    return;
                }

                WPBS.modals.show_modal(false, {
                    template: lightbox_element,
                    callback: (modal) => {
                        
                        WPBS.slider.observe(
                            modal.querySelector('.swiper'),
                            this.swiper_args(args.index ?? 0)
                        )

                        window.MediaWatcher.init(modal)

                    },
                });
            })
            .catch((error) => {
                console.error('WPBS Lightbox: fetch error', error);
            });
    }


}
