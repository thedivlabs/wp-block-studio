import Modals from './modules/modals'
import Loader from './modules/loader'
import Popup from './modules/popup'
import Lightbox from './modules/Lightbox'
import Video from './modules/video'
import Slider from './modules/slider'
import Reveal from './modules/reveal'
import Team from './modules/team'


class WPBS_Theme {

    static modals;
    static loader;
    static popup;
    static settings;
    static lightbox;
    static video;
    static slider;
    static reveal;

    constructor() {

        this.modals = Modals;
        this.loader = Loader;
        this.popup = Popup;
        this.lightbox = Lightbox;
        this.video = Video;
        this.slider = Slider;
        this.reveal = Reveal;
        this.team = Team;

        this.settings = window.wpbsData ?? {};
        this.modals.init();
        this.loader.init();
        this.lightbox.init();
        this.video.init();
        this.slider.init();
        this.reveal.init();
        this.team.init();

        this.init();

        if (document.querySelector('.wpbs-map')) {

            window.maps_callback = () => {
                const maps_loaded_event = new CustomEvent('wpbs_maps_loaded');
                document.dispatchEvent(maps_loaded_event)
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this?.settings?.places?.maps_key}&libraries=places,marker&callback=maps_callback&loading=async`;
            script.id = 'wpbs-google-maps';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }


    }

    gridDividers(element, args = {}, uniqueId = false) {

        if (!element || !uniqueId) {
            return;
        }

        const {divider} = args;

        const colMobile = parseInt(args?.['columns-mobile'] ?? '1');
        const colSmall = parseInt(args?.['columns-small'] ?? '2');
        const colLarge = parseInt(args?.['columns-large'] ?? '3');

        const {breakpoints} = WPBS?.settings ?? {};

        const breakpointLarge = breakpoints[args?.['breakpoint-large'] ?? 'normal'];
        const breakpointSmall = breakpoints[args?.['breakpoint-small'] ?? 'sm'];

        if (!divider) {
            return;
        }

        const container = element.querySelector(':scope > .loop-container');

        const cards = container.querySelectorAll('.loop-card');

        const total = cards.length;

        const selector = '.' + uniqueId;

        const lastRow = {
            mobile: {
                count: Math.floor(total - (Math.floor(total / colMobile) * colMobile)) || colMobile,
            },
            small: {
                count: Math.floor(total - (Math.floor(total / colSmall) * colSmall)) || colSmall,
            },
            large: {
                count: Math.floor(total - (Math.floor(total / colLarge) * colLarge)) || colLarge,
            }
        }

        const styleCss = [
            '@media screen and (max-width: calc(' + breakpointSmall + ' - 1px)) {',
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

            selector + ' .loop-container:has(> .loop-card:nth-of-type(' + (colSmall + 1) + ')) > .loop-card:nth-last-of-type(-n+' + lastRow.small.count + '):after { height:calc(100% + calc(var(--grid-row-gap, var(--grid-col-gap)) / 2)) !important;top: calc(0px - (var(--grid-row-gap, var(--grid-col-gap, 0px)) / 2)); }',
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


        [...document.querySelectorAll('.' + styleSelector)].forEach(tag => tag.remove());

        styleTag.classList.add(styleSelector);
        styleTag.textContent = styleCss;

        document.head.appendChild(styleTag);

        element.classList.add('--divider');

    }

    setMasonry(container) {

        if (!('Masonry' in window)) {
            return;
        }

        if (container.classList.contains('masonry')) {

            const masonryData = Masonry.data(container) || false;
            const gutterSizer = container.querySelector(':scope > .gutter-sizer');

            const total = container.querySelectorAll(':scope > .loop-card').length;
            const cols = parseInt(getComputedStyle(container).getPropertyValue('--columns'))

            if (masonryData) {
                masonryData.destroy();
            }

            if (cols < 2) {
                return false;
            }

            container.classList.add('masonry');

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

        [...(refElement || document).querySelectorAll('img[data-src],picture:has(source[data-src]),video:has(source[data-src]),video:has(source[data-media]),.wpbs-background')].forEach((el) => observerIntersection.observe(el));


    }

    slideToggle(element, duration, callback, display) {
        jQuery(element).slideToggle(duration, function () {
            if (typeof callback === 'function') {
                callback();
            }

        });
    }

    slideUp(element, duration, callback) {
        jQuery(element).slideUp(duration, callback);
    }

    slideDown(element, duration, callback) {
        jQuery(element).slideDown(duration, callback);
    }

    init() {

        wp.domReady(() => {

            this.observeMedia();

            [...document.querySelectorAll('link[data-href]')].forEach((link) => {
                link.href = link.dataset.href;
            })

        })


        document.addEventListener('DOMContentLoaded', () => {

            this.popup.init();

        });

    }
}

window.WPBS = new WPBS_Theme();



