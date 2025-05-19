import Modals from './modules/modals'
import Loader from './modules/loader'
import Popup from './modules/popup'
import {swiperDefaultArgs} from "./inc/helper";


class WPBS_Theme {

    static modals;
    static loader;
    static swiper;
    static popup;
    static settings;

    constructor() {

        this.modals = Modals;
        this.loader = Loader;
        this.popup = Popup;
        this.swiper = {
            args: {
                ...swiperDefaultArgs
            }
        };

        this.settings = window.wpbsData ?? {};

        this.modals.init();
        this.loader.init();


        this.init();
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

    observeMedia(refElement) {
        if (!refElement) {
            return false;
        }

        let timer;

        let observerSize = new ResizeObserver((entries) => {

            clearTimeout(timer);
            timer = setTimeout(() => {
                entries.forEach((entry) => {
                    responsiveVideoSrc(entry.target);
                });
            }, 500);
        });

        function responsiveVideoSrc(video) {
            [...video.querySelectorAll('source')].forEach((source) => {
                const mq = source.dataset.media;
console.log(source);
                if (!mq) {
                    source.remove();
                    return false;
                }

                if (window.matchMedia(mq).matches) {
                    source.src = source.dataset.src;
                } else {
                    source.src = '#';
                }
            })
            video.load();
        }

        function responsiveBackgroundSrc(element) {

            element.classList.remove('lazy');
        }

        let observerIntersection = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {

                    const media = entry.target;
                    observer.unobserve(entry.target);


                    if (media.tagName === 'VIDEO') {
                        responsiveVideoSrc(media);
                        observerSize.observe(media);
                    } else if (media.classList.contains('wpbs-background')) {
                        responsiveBackgroundSrc(media);
                    } else {
                        [media, ...media.querySelectorAll('[data-src],[data-srcset]')].forEach((element) => {

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


    init() {

        document.addEventListener('DOMContentLoaded', () => {

            this.popup.init();
            [...document.querySelectorAll('img[data-src],picture:has(source[data-src]),video:has(source[data-src]),video:has(source[data-media]),.wpbs-background')].forEach((media) => {
                this.observeMedia(media);
            });

        });
    }
}

window.WPBS = new WPBS_Theme();



