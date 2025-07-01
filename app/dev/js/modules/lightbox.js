import {SWIPER_DEFAULT_ARGS} from "Includes/config";

export default class Lightbox {

    static class_name = 'wpbs-lightbox';

    static swiper_args = (index = 0) => {
        return {
            ...SWIPER_DEFAULT_ARGS,
            initialSlide: index,
            spaceBetween: 10,
            slidesPerView: 1,
            zoom: {
                limitToOriginalSize: true,
                maxRatio: 8,
                containerClass: 'swiper-zoom-container',
            }
        };
    };

    static init() {


    }

    static async fetchGallery(args) {

        const endpoint = '/wp-json/wpbs/v1/media-gallery';

        const request = {
            index: args.index,
            gallery_id: parseInt(args.gallery_id),
            card_class: 'w-full h-full object-contain object-center',
        };

        WPBS.loader.toggle();

        return await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': WPBS?.settings?.nonce ?? false,
            },
            body: JSON.stringify(request),
        }).then((response) => {
            WPBS.loader.remove();

            return response.json();
        });
    }

    static toggle(args = {}) {

        this.fetchGallery(args).then(gallery => {

            WPBS.modals.show_modal(false, {
                template: this.component(gallery.content),
                callback: (modal) => {
                    [...modal.querySelectorAll('.swiper')].forEach((slider_element) => {
                        new Swiper(slider_element, this.swiper_args(args.index));
                    })
                }
            });
        });


    }

    static component(slides) {

        const component = document.createElement('div');
        const slider = document.createElement('div');
        const sliderWrapper = document.createElement('div');
        const sliderNav = document.createElement('div');
        const sliderButtonNext = document.createElement('button');
        const sliderButtonPrev = document.createElement('button');
        const sliderPagination = document.createElement('div');

        component.classList.add('wpbs-lightbox', 'flex', 'w-full', 'h-screen', 'overflow-hidden');
        slider.classList.add('wpbs-lightbox__slider', 'swiper');
        sliderWrapper.classList.add('swiper-wrapper');
        sliderNav.classList.add('wpbs-lightbox-nav');
        sliderButtonNext.classList.add('wpbs-lightbox-nav__button', 'wpbs-lightbox-nav__button--next');
        sliderPagination.classList.add('wpbs-lightbox-nav__pagination');
        sliderButtonPrev.classList.add('wpbs-lightbox-nav__button', 'wpbs-lightbox-nav__button--prev');

        const parser = new DOMParser();

        slides.forEach((slide) => {

            slide = parser.parseFromString(slide, 'text/html').body.firstChild;

            const slideElement = document.createElement('div');
            slideElement.classList.add('swiper-slide');
            slideElement.append(slide);
            sliderWrapper.appendChild(slideElement);
        })

        sliderNav.appendChild(sliderButtonNext);
        sliderNav.appendChild(sliderButtonPrev);
        sliderNav.appendChild(sliderPagination);
        slider.appendChild(sliderWrapper);
        slider.appendChild(sliderNav);
        component.appendChild(slider);

        return component;

    }


}