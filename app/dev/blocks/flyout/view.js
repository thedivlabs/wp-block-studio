import {store} from '@wordpress/interactivity';

const {state} = store('wpbs/flyout', {
    state: {
        active: false,
    },
    actions: {
        toggle: () => {
            state.active = !state.active;
            console.log(state.active);
        },
    },
});
