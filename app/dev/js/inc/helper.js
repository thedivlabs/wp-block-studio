export function parseProp(prop) {

    if (prop === '0' || !prop) {
        return '0';
    }

    prop = typeof prop === 'string' ? prop : false;

    if (!prop) {
        return false
    }

    return [
        'var(--wp--',
        prop.replace('var:', '').replaceAll('|', '--'),
        ')'
    ].join('');

}

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
};

export function breakpoint(prop) {

}

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

export function checkKey() {
    const domain = false;
}