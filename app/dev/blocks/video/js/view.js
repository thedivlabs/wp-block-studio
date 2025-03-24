import {store, getElement,getContext} from '@wordpress/interactivity';

const {state} = store('wpbs', {
    callbacks: {
        videoModal: () => {
            const {ref: element} = getElement();
            const {url,title} = getContext();

            console.log(url);
            console.log(title);

            WPBS.modals.toggle_modal(false, {
                template: jQuery('<div/>',{
                    class:'test-modal'
                }).text('QQQ').get(0)
            });

        },
    },
});