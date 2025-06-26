export default class Video {

    static init() {


    }

    static clickHandler(args = {}) {
        //const {ref: element} = getElement();
        //const {url, title, platform} = getContext();

        if (element.classList.contains('active')) {
            return false;
        }

        const baseURL = {
            'rumble': 'https://rumble.com/embed/',
            'youtube': 'https://www.youtube.com/embed/',
            'vimeo': 'https://player.vimeo.com/video/',
        }

        const queryString = {
            'rumble': '',
            'youtube': '?autoplay=1&enablejsapi=1&rel=0',
            'vimeo': '',
        }

        const vid = (new URL(url)).pathname;
        const isModal = element.classList.contains('wpbs-video--modal');
        const classNames = [
            'divlabs-video-player',
            isModal ? 'h-auto overflow-hidden w-[min(140vh,100vw,100%)] max-w-full aspect-video m-auto relative' : 'w-full h-full',
        ].filter(x => x).join(' ');

        const player = jQuery('<iframe />', {
            src: baseURL[platform || 'youtube'] + vid + queryString[platform],
            allow: 'autoplay;',
            allowFullScreen: true,
            title: 'YouTube video player',
            frameBorder: 0,
            width: '100%',
            height: '100%',
            class: 'absolute top-0 left-0 w-full h-full opacity-0 transition-opacity duration-500'
        }).on('load', function () {
            jQuery(this).css({opacity: 1});
            WPBS.loader.toggle({
                remove: true
            });
        });

        const component = jQuery('<div />', {
            class: classNames,
        }).append(player);


        if (isModal) {
            WPBS.modals.toggle_modal(false, {
                template: component.get(0)
            });
        } else {
            element.classList.add('active');
            element.querySelector('.wpbs-video__media').replaceChildren(component.get(0));
        }


    }

}