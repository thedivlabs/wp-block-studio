import Modals from './modules/modals'
import Loader from './modules/loader'
import Popup from './modules/popup'
import Lightbox from './modules/Lightbox'
import Video from './modules/video'
import Slider from './modules/slider'
import Reveal from './modules/reveal'
import Team from './modules/team'
import {gridDividers} from './modules/gridDividers'


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
        this.gridDividers = gridDividers;

        this.settings = window?.WPBS?.settings ?? {};
        this.modals.init();
        this.loader.init();
        this.lightbox.init();
        this.video.init();
        this.slider.init();
        this.reveal.init();
        this.team.init();

        window.WPBS = this;

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


    setMasonry(container) {

        if (!('Masonry' in window)) {
            return;
        }

        if (container.classList.contains('masonry')) {

            const masonryData = Masonry.data(container) || false;
            const gutterSizer = container.querySelector(':scope > .gutter-sizer');

            const total = container.querySelectorAll(':scope > .grid-card').length;
            const cols = parseInt(getComputedStyle(container).getPropertyValue('--columns'))

            if (masonryData) {
                masonryData.destroy();
            }

            if (cols < 2) {
                return false;
            }

            container.classList.add('masonry');

            const masonry = new Masonry(container, {
                itemSelector: '.grid-card',
                //columnWidth: '.grid-card',
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

        document.addEventListener('DOMContentLoaded', () => {

            this.popup.init();


        });


    }
}

new WPBS_Theme();



