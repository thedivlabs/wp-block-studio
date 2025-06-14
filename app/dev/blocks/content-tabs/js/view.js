import {store, getElement, getContext} from '@wordpress/interactivity';

function setMinHeight(component) {

    if (component.classList.contains('--hide-tabs')) {
        return;
    }

    const currentHeight = component.offsetHeight;
    const previousHeight = parseInt(component.dataset.tabHeight || '0', 10);
    const maxHeight = Math.max(currentHeight, previousHeight);

    component.dataset.tabHeight = String(maxHeight);
    component.style.minHeight = `${maxHeight}px`;
}

const {state} = store('wpbs/content-tabs', {

    actions: {
        init: () => {

            const {ref: component} = getElement();

            if (component.classList.contains('tabs-initialized')) {
                return false;
            }

            component.classList.add('tabs-initialized');

            setMinHeight(component);

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

            function tabHandler(button, index) {

                const next_tab = tabs[index];

                if (button.classList.contains('active') || !next_tab) {
                    return;
                }

                const cur_tab = container.querySelector(':scope > .active') || tabs[0];

                [...nav_buttons].forEach((btn, index) => {
                    btn.classList.remove('active');
                });

                button.classList.add('active');

                const fadeOutHandler = () => {

                    cur_tab.classList.remove('active');
                    cur_tab.removeEventListener('transitionend', fadeOutHandler);

                    next_tab.style.opacity = '0';
                    next_tab.classList.add('active');

                    setTimeout(() => {
                        next_tab.style.opacity = '1';
                    }, 50)

                };

                const fadeInHandler = () => {
                    component.classList.remove('animating');
                    setMinHeight(component);
                    next_tab.style.opacity = '';
                    next_tab.removeEventListener('transitionend', fadeInHandler);
                };

                if (isFade) {

                    cur_tab.addEventListener('transitionend', fadeOutHandler);
                    next_tab.addEventListener('transitionend', fadeInHandler);

                    component.classList.add('animating');

                    cur_tab.style.opacity = '0';

                } else {
                    [...tabs].forEach(tab => tab.classList.remove('active'));
                    next_tab.classList.add('active');
                    setMinHeight(component);
                }
            }

            [...nav_buttons].forEach((button, index) => {

                button.addEventListener('click', (e) => tabHandler(button, index));

            })

        }
    }


});