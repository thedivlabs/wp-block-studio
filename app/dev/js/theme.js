import Modals from './modules/modals'
import Loader from './modules/loader'
import Popup from './modules/popup'


class WPBS_Theme {

    static modals;
    static loader;
    static popup;
    static settings;
    static videos;

    constructor() {

        this.modals = Modals;
        this.loader = Loader;
        this.popup = Popup;
        this.videos = [];

        this.settings = window.wpbsData ?? {};
        this.modals.init();
        this.loader.init();


        this.init();

        let timer;

        window.addEventListener('resize', () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                this.videos.forEach((video) => {
                    this.responsiveVideoSrc(video);
                })
            }, 500);
        });
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


    init() {

        document.addEventListener('DOMContentLoaded', () => {

            const media = document.querySelectorAll('img[data-src],picture:has(source[data-src]),video:has(source[data-src]),video:has(source[data-media]),.wpbs-background');

            this.popup.init();

            [...media].forEach((media) => {
                this.observeMedia(media);
            });

        });


    }
}

window.WPBS = new WPBS_Theme();



