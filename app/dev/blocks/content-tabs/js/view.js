import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs/content-tabs', {

    actions: {
        init: () => {

            const {ref: component} = getElement();

            if (component.classList.contains('tabs-initialized')) {
                return false;
            }

            component.classList.add('tabs-initialized');

            const nav = component.querySelector('.wpbs-content-tabs-nav');
            const container = component.querySelector('.wpbs-content-tabs-container');

            if (!nav || !container) {
                return false;
            }

            const nav_buttons = nav.querySelectorAll('.wpbs-content-tabs-nav__button');
            const tabs = container.querySelectorAll('.wpbs-content-tabs-panel');

            if (!nav_buttons.length || !tabs.length) {
                return false;
            }

            if (![...tabs].some(tab => tab.classList.contains('active'))) {
                tabs[0].classList.add('active');
            }

            [...nav_buttons].forEach((button, index) => {

                button.addEventListener('click', (e) => {

                    const next_tab = tabs[index];

                    if (button.classList.contains('active') || !next_tab) {
                        return;
                    }

                    const cur_tab = container.querySelector(':scope > .active') || tabs[0];

                    cur_tab.addEventListener('transitionend', () => {
                        cur_tab.classList.remove('active','is-hidden');
                        cur_tab.removeEventListener('transitionend', this);
                        next_tab.classList.add('active');
                    }, {once: true});

                    cur_tab.classList.add('is-hidden');

                    [...container.querySelectorAll(':scope > .active'), ...nav_buttons].forEach(cur_tab => {
                        cur_tab.classList.remove('active');
                    });

                    button.classList.add('active');

                })

            })

        }
    }


});