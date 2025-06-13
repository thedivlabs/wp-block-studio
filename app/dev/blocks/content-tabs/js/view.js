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
            const isFade = component.classList.contains('is-style-fade');

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

                    [...nav_buttons].forEach((btn, index) => {
                        btn.classList.remove('active');
                    });

                    button.classList.add('active');

                    if (isFade) {
                        const onTransitionEnd = () => {
                            cur_tab.classList.remove('animating');
                            component.classList.remove('animating');
                            cur_tab.removeEventListener('transitionend', onTransitionEnd);
                        };

                        cur_tab.addEventListener('transitionend', onTransitionEnd);

                        component.classList.add('animating');
                        cur_tab.classList.remove('active');
                        cur_tab.classList.add('animating');
                        next_tab.classList.add('active');

                    } else {
                        cur_tab.classList.remove('active');
                        next_tab.classList.add('active');
                    }


                })

            })

        }
    }


});