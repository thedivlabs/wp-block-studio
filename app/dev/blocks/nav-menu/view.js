import {store, getElement, getContext} from '@wordpress/interactivity';



const {state} = store('wpbs/nav-menu', {
    actions: {
        init: () => {

            const {ref: element} = getElement();

            const is_accordion = element.classList.contains('is-style-accordion');

            [...element.querySelectorAll('li:has(> .sub-menu)')].forEach((menu_item) => {

                const link = menu_item.querySelector(':scope > a');
                const sub_menu = menu_item.querySelector(':scope > .sub-menu');

                if (!is_accordion) {
                    menu_item.addEventListener('mouseenter', (e) => {
                        const bounds = sub_menu.getBoundingClientRect();
                        const width = sub_menu.offsetWidth;

                        if (bounds.left + width > window.outerWidth) {
                            sub_menu.classList.add('offset-right');
                        } else {
                            sub_menu.classList.remove('offset-right');
                        }
                        if (bounds.left < 0) {
                            sub_menu.classList.add('offset-left');
                        } else {
                            sub_menu.classList.remove('offset-left');
                        }
                    }, {
                        passive: true
                    });
                }


            });
        }
    },
});