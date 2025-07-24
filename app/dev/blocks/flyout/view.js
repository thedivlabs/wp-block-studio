import {getElement, store} from '@wordpress/interactivity';

const {state} = store('wpbs/flyout', {
    state: {
        active: false,
    },
    actions: {
        toggle: (event) => {


            const {ref} = getElement();

            const isButton = ref.closest('.wpbs-flyout-button') !== null;

            if (!isButton && event.target !== ref) {
                return;
            }

            state.active = !state.active;

            document.body.classList.toggle('wpbs-body-lock', state.active);


        },
    },
});
