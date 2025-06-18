export const SWIPER_OPTIONS_DEFAULT = {
    createElements: false,
    navigation: {
        enabled: true,
        nextEl: '.wpbs-slider-btn--next',
        prevEl: '.wpbs-slider-btn--prev',
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
};


export const imageButtonStyle = {
    border: '1px dashed lightgray',
    width: '100%',
    height: 'auto',
    aspectRatio: '16/9',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
}

