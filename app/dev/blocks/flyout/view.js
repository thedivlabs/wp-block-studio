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

            if (state.active) {
                document.body.classList.add('wpbs-body-lock');
            } else {
                document.body.classList.remove('wpbs-body-lock');
            }

        },
    },
});
