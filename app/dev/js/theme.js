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

        console.log(this.settings);

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

                    if (media.dataset.src) {
                        media.src = media.dataset.src;
                        media.removeAttribute('data-src');
                    }

                    if (media.dataset.srcset) {
                        media.srcset = media.dataset.srcset;
                        media.removeAttribute('data-srcset');
                    }

                    if (media.tagName === 'VIDEO') {
                        responsiveVideoSrc(media);
                        observerSize.observe(media);
                    } else if (media.classList.contains('wpbs-background')) {
                        responsiveBackgroundSrc(media);
                    }

                }
            });

        }, {
            root: null,
            rootMargin: "90px",
            threshold: 0,
        });

        [...refElement.querySelectorAll('[data-src],[data-srcset],.wpbs-background.lazy')].forEach((media) => {
            observerIntersection.observe(media);
        });
    }


    init() {

        document.addEventListener('DOMContentLoaded', () => {

            this.popup.init();

            [...document.querySelectorAll('video:has(source[data-media]):has(source[data-src]),.wpbs-background.lazy')].forEach((media) => {
                this.observeMedia(media);
            });

        });
    }
}

window.WPBS = new WPBS_Theme();



