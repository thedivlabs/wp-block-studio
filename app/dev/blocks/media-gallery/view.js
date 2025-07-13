import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs/media-gallery', {
    actions: {
        init: () => {

            const {ref: element} = getElement();
            const context = getContext();

            const {gallery, slider: swiper_args, grid, uniqueId} = context;

            if (!uniqueId) {
                return;
            }

            const is_slider = gallery?.type === 'slider';
            const gallery_id = gallery?.gallery_id ?? false;

            if (!!is_slider) {
                WPBS.slider.observe(element, swiper_args);
            }

            WPBS.setMasonry(element);

            WPBS.gridDividers(element, grid, uniqueId);

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
            });


        },
        pagination: async (event) => {

            event.preventDefault();

            const {ref: button} = getElement();

            const element = button.closest('.wpbs-media-gallery');
            const container = element.querySelector(':scope > .wpbs-media-gallery-container');
            const context = getContext();

            const args = JSON.parse(element.querySelector('script.wpbs-media-gallery-args')?.textContent ?? '{}');
            const card = args?.card ?? false;
            const containerAttributes = args?.container ?? false;
            const page = parseInt(element.dataset?.page ?? 1);

            const {gallery, grid, slider, type, uniqueId} = context;

            const nonce = WPBS?.settings?.nonce ?? false;

            const endpoint = '/wp-json/wp/v2/block-renderer/wpbs/media-gallery-container';

            const request = {
                attributes: {
                    testing: 'QQQQQQ',
                    ...containerAttributes,
                },
                context: 'edit',
                'wpbs/settings': context,
                'wpbs/card': card,
                'wpbs/page': page
            };

            console.log(request);

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

                    console.log(result);

                    return false;

                    WPBS.loader.toggle({
                        remove: true
                    });

                    const parser = new DOMParser();
                    const {is_last, content, css} = result ?? {};

                    element.dataset.page = String(parseInt(page) + 1);

                    if (!!is_last || !content) {
                        button.remove();
                        // return;
                    }

                    const newNodes = parser.parseFromString(content, 'text/html');

                    if (newNodes) {
                        container.append(...newNodes.body.childNodes);
                    }

                    WPBS.gridDividers(element, context?.grid, context?.uniqueId);
                    WPBS.setMasonry(element);

                    [...element.querySelectorAll('[data-src],[data-srcset]')].forEach((el) => WPBS.observeMedia(el));

                    if (css) {
                        const styleTag = document.createElement('style');
                        styleTag.innerHTML = css;
                        document.head.appendChild(styleTag);
                    }


                })
        },
    },
});