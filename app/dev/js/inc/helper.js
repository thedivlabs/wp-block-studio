export const swiperDefaultArgs = {
    createElements: false,
    navigation: {
        enabled: true,
        nextEl: '.wpbs-slider-nav__btn.wpbs-slider-nav__btn--next',
        prevEl: '.wpbs-slider-nav__btn.wpbs-slider-nav__btn--prev',
    },
    pagination: {
        enabled: true,
        el: '.swiper-pagination',
    },
    watchSlidesProgress: true,
    updateOnWindowResize: true,
    simulateTouch: true,
    slidesPerView: 1,
    spaceBetween: 0,
    watchOverflow: true,
    passiveListeners: true,
    grabCursor: true,
    uniqueNavElements: true,
    on: {
        afterInit: (swiper) => {
            if(swiper.enabled === false) {
                swiper.el.classList.add('swiper--disabled');
            } else {
                swiper.el.classList.remove('swiper--disabled');
            }
            if (swiper.slides.length < 2) {
                swiper.disable();
            }
            if (swiper.autoplay.running) {
                swiper.autoplay.pause();
                setTimeout(() => {
                    swiper.autoplay.resume();
                }, 5000);
            }
        },
        paginationUpdate: (swiper, paginationEl) => {

            if (!!swiper?.['isBeginning']) {
                swiper.el.classList.add('swiper--start');
            } else {
                swiper.el.classList.remove('swiper--start');
            }
        },
        resize: (swiper) => {
            if(swiper.enabled === false) {
                swiper.el.classList.add('swiper--disabled');
            } else {
                swiper.el.classList.remove('swiper--disabled');
            }
        }
    }
};