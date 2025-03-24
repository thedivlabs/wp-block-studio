import {store, getElement} from '@wordpress/interactivity';

const {state} = store('wpbs', {
    callbacks: {
        videoModal: () => {
            const {ref: element} = getElement();
            console.log('Video toggle');
            WPBS.modals.toggle_modal(false, {
                template: jQuery('<div/>',{
                    class:'test-modal'
                }).text('QQQ').get(0)
            });

        },
    },
});