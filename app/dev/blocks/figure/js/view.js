import {store, getContext} from '@wordpress/interactivity';

store('wpbs', {
    callbacks: {
        startCountdown: () => {
            console.log('startCountdown...');
        },
    },
});