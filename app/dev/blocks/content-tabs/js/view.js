import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs/content-tabs', {

    actions: {
        init: () => {

            const {ref: component} = getElement();

            const nav = component.querySelector('.wpbs-content-tabs-nav');
            const container = component.querySelector('.wpbs-content-tabs-container');

            if (!nav || !container) {
                return false;
            }

            const nav_buttons = nav.querySelectorAll('.wpbs-content-tabs-nav__button');
            const tabs = container.querySelectorAll('.wpbs-content-tabs-panel');

            if (!nav_buttons || !tabs) {
                return false;
            }

            [...nav_buttons].forEach((button, index) => {

                button.addEventListener('click', (e) => {

                    const next_tab = tabs[index];

                    if (button.classList.contains('active') || !next_tab) {
                        return false;
                    }

                    [...container.querySelectorAll(':scope > .active')].forEach(cur_tab => {
                        cur_tab.classList.remove('active');
                    })

                    next_tab.classList.add('active');

                })

            })

        }
    }


});