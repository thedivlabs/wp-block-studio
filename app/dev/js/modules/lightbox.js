import {SWIPER_ARGS_VIEW} from "Includes/config";

export default class Lightbox {

    static class_name = 'wpbs-lightbox';

    static swiper_args = (index = 0) => {
        return {
            ...SWIPER_ARGS_VIEW,
            initialSlide: index,
            spaceBetween: 10,
            slidesPerView: 1,
            simulateTouch: true,
            navigation: {
                nextEl: '.wpbs-lightbox-nav__button--next',
                prevEl: '.wpbs-lightbox-nav__button--prev',
            },
            zoom: {
                limitToOriginalSize: true,
                maxRatio: 8,
                containerClass: 'swiper-zoom-container',
            }
        };
    };

    static init() {


    }

    static async toggle(args = {}) {

        const component = document.createElement('div');
        const slider = document.createElement('div');
        const sliderNav = document.createElement('div');

        const sliderButtonNext = document.createElement('button');
        const sliderButtonPrev = document.createElement('button');
        const sliderPagination = document.createElement('div');

        component.classList.add('wpbs-lightbox', 'flex', 'w-full', 'h-screen', 'overflow-hidden', 'wpbs-lightbox--group');
        slider.classList.add('wpbs-lightbox__slider', 'swiper');
        sliderNav.classList.add('wpbs-lightbox-nav', 'wpbs-slider-nav');
        sliderButtonNext.classList.add('wpbs-lightbox-nav__button', 'wpbs-lightbox-nav__button--next');
        sliderPagination.classList.add('wpbs-lightbox-nav__pagination', 'swiper-pagination');
        sliderButtonPrev.classList.add('wpbs-lightbox-nav__button', 'wpbs-lightbox-nav__button--prev');

        const endpoint = '/wp-json/wp/v2/block-renderer/wpbs/lightbox-container';

        const attributes = {
            media: args?.media
        }

        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': WPBS?.settings?.nonce ?? '',
            },
            body: JSON.stringify({
                attributes: attributes,
                context: 'edit'
            }),
        }).then(response => response.json()).then(result => {

            const parser = new DOMParser();

            const sliderWrapper = parser.parseFromString(result?.rendered ?? '', 'text/html').querySelector('.wpbs-lightbox-container');

            console.log(result);

            sliderNav.appendChild(sliderButtonPrev);
            sliderNav.appendChild(sliderPagination);
            sliderNav.appendChild(sliderButtonNext);
            slider.appendChild(sliderWrapper);
            slider.appendChild(sliderNav);
            component.appendChild(slider);


            WPBS.modals.show_modal(false, {
                template: component,
                callback: (modal) => {
                    [...modal.querySelectorAll('.swiper')].forEach((slider_element) => {
                        new Swiper(slider_element, this.swiper_args(args.index));
                        [...modal.querySelectorAll('[data-src],[data-srcset]')].forEach((el) => WPBS.observeMedia(el));
                    })
                }
            });
        });


    }


}