import {store, getElement, getContext} from '@wordpress/interactivity';

const {state} = store('wpbs', {
    callbacks: {
        videoModal: () => {
            const {ref: element} = getElement();
            const {url, title} = getContext();
            const embed_base = 'https://www.youtube.com/embed/';
            const vid = (new URL(url)).pathname;

            const player = jQuery('<iframe />', {
                src: embed_base + vid + '?autoplay=1&enablejsapi=1&rel=0',
                allow: 'autoplay;',
                allowFullScreen: true,
                title: 'YouTube video player',
                frameBorder: 0,
                width: '100%',
                height: '100%',
            }).css({opacity: 0, transition: 'opacity .5s'}).on('load', function () {
                jQuery(this).css({opacity: 1})
                WPBS.loader.toggle({
                    remove: true
                });
            });

            const component = jQuery('<div />', {
                class: 'divlabs-video-player'
            }).append(player);

            WPBS.modals.toggle_modal(false, {
                template: component.get(0)
            });

        },
    },
});