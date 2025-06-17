export default class Lightbox {

    static class_name = 'wpbs-lightbox';

    static init() {

        const test = document.createElement('div');
        test.textContent = 'Lightbox';

        const slider = this.component([test]);
        
        window.addEventListener('load', () => {
            this.toggle(slider);
            console.log(slider);
        });

    }

    static image(args = {}) {


    }

    static video(args = {}) {


    }

    static toggle(component, args = {}) {

        WPBS.modals.show_modal(false, {
            template: component
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