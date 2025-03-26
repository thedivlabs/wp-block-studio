import {store, getElement, getContext} from '@wordpress/interactivity';

const {state} = store('wpbs', {
    callbacks: {
        videoModal: () => {
            const {ref: element} = getElement();
            const {url, title, platform} = getContext();

            if (element.classList.contains('active')) {
                return false;
            }

            const baseURL = {
                'rumble': 'https://rumble.com/embed/',
                'youtube': 'https://www.youtube.com/embed/',
                'vimeo': 'https://player.vimeo.com/video/',
            }

            const vid = (new URL(url)).pathname;
            const isModal = element.classList.contains('wpbs-video--modal');
            const classes = [
                'divlabs-video-player',
                isModal ? 'w-full aspect-video' : 'w-full h-full',
            ].filter(x => x).join(' ');

            const player = jQuery('<iframe />', {
                src: baseURL[platform || 'youtube'] + vid + '?autoplay=1&enablejsapi=1&rel=0',
                allow: 'autoplay;',
                allowFullScreen: true,
                title: 'YouTube video player',
                frameBorder: 0,
                width: '100%',
                height: '100%',
            }).css({opacity: 0, transition: 'opacity .5s'}).on('load', function () {
                jQuery(this).css({opacity: 1});
                WPBS.loader.toggle({
                    remove: true
                });
            });

            const component = jQuery('<div />', {
                class: classes,
            }).append(player);


            if (isModal) {
                WPBS.modals.toggle_modal(false, {
                    template: component.get(0)
                });
            } else {
                element.classList.add('active');
                element.querySelector('.wpbs-video__media').replaceChildren(component.get(0));
            }


        },
        observe: () => {
            const {ref: element} = getElement();
            WPBS.observeMedia(element);
        },
    },

});