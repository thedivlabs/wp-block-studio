export default class Lightbox {

    static class_name = 'wpbs-lightbox';

    static init() {

        const test = document.createElement('div');
        test.textContent = 'Lightbox';

        const slider = this.component([test]);

        document.addEventListener('click', (e) => this.clickHandler(e), {passive: true});

    }

    static async fetchGallery(args) {

        const endpoint = '/wp-json/wpbs/v1/media-gallery';

        const request = {
            card: args.card,
            index: args.index,
            galleryId: args.galleryId,
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
            return response;
        });
    }

    static clickHandler(e) {

        const parent = e.target.closest('.lightbox-gallery');
        const data = JSON.parse(JSON.parse(parent.dataset?.wpContext ?? '{}').gallery ?? '{}');
        const card = e.target.closest('.wpbs-lightbox-card');

        console.log(data);

        if (!card || !data) {
            return;
        }

        const index = card.dataset.index;

        this.fetchGallery({
            index: index,
            card: card,
            galleryId: data.galleryId,
        }).then(response => response.json())
            .then(result => {
                console.log(result);
            });

    }

    static image(args = {}) {


    }

    static video(args = {}) {


    }

    static toggle(args = {}) {

        WPBS.modals.show_modal(false, {
            template: this.component([])
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

        component.classList.add('wpbs-lightbox');
        slider.classList.add('wpbs-lightbox__slider', 'swiper');
        sliderWrapper.classList.add('swiper-wrapper');
        sliderNav.classList.add('wpbs-lightbox__nav');
        sliderButtonNext.classList.add('wpbs-lightbox__button', 'wpbs-lightbox__button--next');
        sliderButtonPrev.classList.add('wpbs-lightbox__button', 'wpbs-lightbox__button--prev');
        sliderPagination.classList.add('wpbs-lightbox__pagination');

        slides.forEach((slide) => {
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