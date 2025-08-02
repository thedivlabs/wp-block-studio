import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs/nav-menu', {
    actions: {
        init: () => {

            const {ref: element} = getElement();

            const is_accordion = element.classList.contains('is-style-accordion');

            if (!is_accordion) {
                [...element.querySelectorAll('li:has(> .sub-menu)')].forEach((menu_item) => {

                    const sub_menu = menu_item.querySelector(':scope > .sub-menu');

                    sub_menu.addEventListener('transitionend', (e) => {

                        const opacity = window.getComputedStyle(sub_menu).opacity;

                        if (parseFloat(opacity) < .1) {
                            sub_menu.classList.remove('offset-right');
                            sub_menu.classList.remove('offset-left');
                        }
                    }, {
                        passive: true
                    });

                    menu_item.addEventListener('mouseenter', (e) => {

                        const bounds = sub_menu.getBoundingClientRect();
                        const width = sub_menu.offsetWidth;

                        if (bounds.left + width > window.outerWidth) {
                            sub_menu.classList.add('offset-right');
                        }
                        if (bounds.left < 0) {
                            sub_menu.classList.add('offset-left');
                        }

                    }, {
                        passive: true
                    });


                });
            }

        }
    },
});