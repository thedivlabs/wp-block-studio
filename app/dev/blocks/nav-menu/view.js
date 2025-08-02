import {store, getElement, getContext} from '@wordpress/interactivity';



const {state} = store('wpbs/nav-menu', {
    actions: {
        init: () => {

            const {ref: element} = getElement();

            const is_accordion = element.classList.contains('is-style-accordion');

            [...element.querySelectorAll('li:has(> .sub-menu)')].forEach((menu_item) => {

                const sub_menu = menu_item.querySelector(':scope > .sub-menu');

                menu_item.addEventListener('mouseenter', (e) => {

                    if (!is_accordion) {
                        const bounds = sub_menu.getBoundingClientRect();
                        const width = sub_menu.offsetWidth;

                        if (bounds.left + width > window.outerWidth) {
                            sub_menu.classList.add('offset-right');
                        }
                        if (bounds.left < 0) {
                            sub_menu.classList.add('offset-left');
                        }
                    }

                }, {
                    passive: true
                });

                menu_item.addEventListener('mouseleave', (e) => {

                    if (!is_accordion) {
                        sub_menu.classList.remove('offset-right');
                        sub_menu.classList.remove('offset-left');
                    }

                }, {
                    passive: true
                });




            });
        }
    },
});