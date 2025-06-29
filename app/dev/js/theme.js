import Modals from './modules/modals'
import Loader from './modules/loader'
import Popup from './modules/popup'
import Lightbox from './modules/Lightbox'
import Video from './modules/video'


class WPBS_Theme {

    static modals;
    static loader;
    static popup;
    static settings;
    static lightbox;
    static video;

    constructor() {

        this.modals = Modals;
        this.loader = Loader;
        this.popup = Popup;
        this.lightbox = Lightbox;
        this.video = Video;

        this.settings = window.wpbsData ?? {};
        this.modals.init();
        this.loader.init();
        this.lightbox.init();
        this.video.init();

        this.init();

    }

    gridDividers(grid, context) {

        if (!grid) {
            return;
        }

        const {uniqueId, divider} = context;

        const colMobile = parseInt(context?.['columns-mobile'] ?? 1);
        const colSmall = parseInt(context?.['columns-small'] ?? 2);
        const colLarge = parseInt(context?.['columns-large'] ?? 3);

        const {breakpoints} = WPBS?.settings ?? {};

        const breakpointLarge = breakpoints[context?.['breakpoint-large'] ?? 'lg'];
        const breakpointSmall = breakpoints[context?.['breakpoint-small'] ?? 'sm'];

        if (!divider) {
            return;
        }

        const container = grid.querySelector(':scope > .loop-container');

        const cards = container.querySelectorAll('.loop-card');

        const total = cards.length;

        const selector = '.' + uniqueId;

        const lastRow = {
            mobile: {
                count: Math.floor(total - (Math.floor(total / colMobile) * colMobile)) || parseInt(colMobile),
            },
            small: {
                count: Math.floor(total - (Math.floor(total / colSmall) * colSmall)) || parseInt(colSmall),
            },
            large: {
                count: Math.floor(total - (Math.floor(total / colLarge) * colLarge)) || parseInt(colLarge),
            }
        }

        const styleCss = [
            '@media screen and (width < ' + breakpointSmall + ') {',
            selector + ' .loop-container > .loop-card:nth-of-type( ' + colMobile + 'n+1 ):after { content: none !important; }',
            selector + ' .loop-container > .loop-card:nth-of-type( n+' + (colMobile + 1) + '):after { height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
            selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colMobile + 1) + ')) > .loop-card:before { content:"" }',
            selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colMobile + 1) + ')) > .loop-card:nth-of-type(-n+' + (colMobile + 1) + '):after { height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));top: 0; }',
            selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colMobile + 1) + ')) > .loop-card:nth-of-type(n+' + (colMobile + 2) + '):after { height: calc(100% + var(--grid-row-gap, var(--grid-col-gap, 0px)));top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
            selector + ' .loop-container > .loop-card:nth-of-type( ' + colMobile + 'n ):before { width: calc(100% + calc(var(--grid-col-gap) / 2)); }',
            selector + ' .loop-container > .loop-card:nth-of-type( ' + colMobile + 'n+1 ):before { width: ' + (colMobile > 1 ? 'calc(100% + calc(var(--grid-col-gap) / 2))' : '100%') + '; left: 0; }',

            selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colMobile + 1) + ')) > .loop-card:nth-last-of-type(-n+' + lastRow.mobile.count + '):after { height:calc(100% + calc(var(--grid-row-gap, var(--grid-col-gap)) / 2)) !important;top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
            selector + ' .loop-container > .loop-card:nth-last-of-type(-n+' + lastRow.mobile.count + '):before { content:none !important; }',
            '}',

            '@media screen and (min-width: ' + breakpointSmall + ') and (max-width: calc(' + breakpointLarge + ' - 1px)) {',
            selector + ' .loop-container > .loop-card:nth-of-type( ' + colSmall + 'n+1 ):after { content: none !important; }',
            selector + ' .loop-container > .loop-card:nth-of-type( n+' + (colSmall + 1) + '):after { height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
            selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colSmall + 1) + ')) > .loop-card:before { content:"" }',
            selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colSmall + 1) + ')) > .loop-card:nth-of-type(-n+' + (colSmall + 1) + '):after { height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));top: 0; }',
            selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colSmall + 1) + ')) > .loop-card:nth-of-type(n+' + (colSmall + 2) + '):after { height: calc(100% + var(--grid-row-gap, var(--grid-col-gap, 0px)));top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
            selector + ' .loop-container > .loop-card:nth-of-type( ' + colSmall + 'n ):before { width: calc(100% + calc(var(--grid-col-gap) / 2)); }',
            selector + ' .loop-container > .loop-card:nth-of-type( ' + colSmall + 'n+1 ):before { width: ' + (colSmall > 1 ? 'calc(100% + calc(var(--grid-col-gap) / 2))' : '100%') + '; left: 0; }',

            selector + ' .loop-container > .loop-card:nth-last-of-type(-n+' + lastRow.small.count + '):after { height:calc(100% + calc(var(--grid-row-gap, var(--grid-col-gap)) / 2)) !important;top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
            selector + ' .loop-container > .loop-card:nth-last-of-type(-n+' + lastRow.small.count + '):before { content:none !important; }',
            '}',

            '@media screen and (min-width: ' + breakpointLarge + ') {',
            selector + ' .loop-container > .loop-card:nth-of-type( ' + colLarge + 'n+1 ):after { content: none !important; }',
            selector + ' .loop-container > .loop-card:nth-of-type( n+' + (colLarge + 1) + '):after { height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
            selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colLarge + 1) + ')) > .loop-card:before { content:"" }',
            selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colLarge + 1) + ')) > .loop-card:nth-of-type(-n+' + (colLarge + 1) + '):after { height: calc(100% + (var(--grid-row-gap, var(--grid-col-gap)) / 2));top: 0; }',
            selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colLarge + 1) + ')) > .loop-card:nth-of-type(n+' + (colLarge + 2) + '):after { height: calc(100% + var(--grid-row-gap, var(--grid-col-gap, 0px)));top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
            selector + ' .loop-container > .loop-card:nth-of-type( ' + colLarge + 'n ):before { width: calc(100% + calc(var(--grid-col-gap) / 2)); }',
            selector + ' .loop-container > .loop-card:nth-of-type( ' + colLarge + 'n+1 ):before { width: ' + (colLarge > 1 ? 'calc(100% + calc(var(--grid-col-gap) / 2))' : '100%') + '; left: 0; }',

            selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colLarge + 1) + ')) > .loop-card:nth-last-of-type(-n+' + lastRow.large.count + '):after { height:calc(100% + calc(var(--grid-row-gap, var(--grid-col-gap)) / 2)) !important;top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
            selector + ' .loop-container > .loop-card:nth-last-of-type(-n+' + lastRow.large.count + '):before { content:none !important; }',

            '}',
        ].join('\r\n');

        const styleTag = document.createElement('style');
        const styleSelector = [uniqueId, 'divider-styles'].join('-');

        styleTag.classList.add(styleSelector);
        styleTag.textContent = styleCss;

        document.head.querySelector('.' + styleSelector)?.remove();

        document.head.appendChild(styleTag);

        grid.classList.add('--divider');

    }

    setMasonry(grid) {

        if (!'Masonry' in window) {
            return;
        }

        if (grid && grid.classList.contains('--masonry')) {

            const container = grid.querySelector(':scope > .loop-container');
            const masonryData = Masonry.data(container) || false;
            const gutterSizer = container.querySelector(':scope > .gutter-sizer');
            if (masonryData) {
                masonryData.destroy();
            }

            const masonry = new Masonry(container, {
                itemSelector: '.loop-card',
                //columnWidth: '.loop-card',
                gutter: gutterSizer,
                percentPosition: true,
                horizontalOrder: true,
            });
            masonry.layout();

        }
    }

    set_cookie(cname, cvalue, exdays = false) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        const expires = exdays === false ? null : "expires=" + d.toUTCString();
        const args = [
            JSON.stringify(cvalue),
            expires,
            'path=/'
        ].filter((arg) => arg).join(';');
        document.cookie = cname + "=" + args;
    }

    get_cookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return JSON.parse(c.substring(name.length, c.length));
            }
        }
        return '';
    }

    responsiveBackgroundSrc(element) {

        element.classList.remove('lazy');
    }

    responsiveVideoSrc(video) {

        [...video.querySelectorAll('source')].forEach((source) => {
            const mq = source.dataset.media;

            if (!mq) {
                source.remove();
                return false;
            }

            if (window.matchMedia(mq).matches) {
                source.src = source.dataset.src;
            } else {
                source.src = '#';
            }
        });

        video.load();

    }

    observeMedia(refElement) {
        if (!refElement) {
            return false;
        }

        let observerIntersection = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {

                    const media = entry.target;
                    observer.unobserve(entry.target);

                    if (media.tagName === 'VIDEO') {
                        this.videos.push(media);
                        this.responsiveVideoSrc(media);
                    } else if (media.classList.contains('wpbs-background')) {
                        this.responsiveBackgroundSrc(media);
                    } else {
                        [...media.querySelectorAll('[data-src],[data-srcset]'), media].forEach((element) => {

                            if (element.dataset.src) {
                                element.src = element.dataset.src;
                                element.removeAttribute('data-src');
                            }
                            if (element.dataset.srcset) {
                                element.srcset = element.dataset.srcset;
                                element.removeAttribute('data-srcset');
                            }

                        });
                    }


                }
            });

        }, {
            root: null,
            rootMargin: "90px",
            threshold: 0,
        });

        observerIntersection.observe(refElement);
    }

    slideToggle(element, duration, callback) {
        jQuery(element).slideToggle(duration, callback);
    }

    slideUp(element, duration, callback) {
        jQuery(element).slideUp(duration, callback);
    }

    slideDown(element, duration, callback) {
        jQuery(element).slideDown(duration, callback);
    }


    init() {

        wp.domReady(() => {
            const media = document.querySelectorAll('img[data-src],picture:has(source[data-src]),video:has(source[data-src]),video:has(source[data-media]),.wpbs-background');


            [...media].forEach((media) => {
                this.observeMedia(media);
            });
        })


        document.addEventListener('DOMContentLoaded', () => {

            this.popup.init();
        });


    }
}

window.WPBS = new WPBS_Theme();



