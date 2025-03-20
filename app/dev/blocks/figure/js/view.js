import {store, getContext, getElement} from '@wordpress/interactivity';

const {state} = store('wpbs', {
    callbacks: {
        startCountdown: () => {
            const {ref} = getElement();
            console.log('startCountdown...');
        },
    },
});