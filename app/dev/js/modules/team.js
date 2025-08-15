export default class Team {


    static init() {


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
                media: args?.media,
            }),
        }).then(response => response.json()).then(result => {

            const parser = new DOMParser();

            const lightbox_element = parser.parseFromString(result?.rendered ?? '', 'text/html').querySelector('body > .wpbs-lightbox');


            WPBS.modals.show_modal(false, {
                template: lightbox_element,
                callback: (modal) => {
                    [...modal.querySelectorAll('.swiper')].forEach((slider_element) => {
                        WPBS.slider.observe(slider_element, this.swiper_args(args.index));
                        WPBS.observeMedia(modal);
                    })
                }
            });
        });


    }


}