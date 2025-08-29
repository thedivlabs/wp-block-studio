import {store, getElement} from '@wordpress/interactivity';

function initAccordion(element) {

    const toggleItems = element.querySelectorAll(':scope > .wpbs-nav-menu-container > li.menu-item-has-children > a');

    if (!toggleItems.length) {
        return false;
    }

    [...toggleItems].forEach((toggleItem) => {

        toggleItem.addEventListener('click', (e) => {
            e.preventDefault();

            const parent = e.target.parentElement;
            const submenu = parent.querySelector(':scope > .sub-menu');
            parent.classList.toggle('active');

            WPBS.slideToggle(submenu, 500, () => {

            });
        })

    })

}

function initDropdown(element) {
    if (!element || element.classList.contains('is-style-accordion')) {
        return false;
    }

    [...element.querySelectorAll('li:has(> .sub-menu)')].forEach((menu_item) => {

        const sub_menu = menu_item.querySelector(':scope > .sub-menu');

        if (!sub_menu) {
            return;
        }

        sub_menu.addEventListener('transitionend', (e) => {

            const opacity = window.getComputedStyle(sub_menu).opacity;

            if (parseFloat(opacity) < 1) {
                sub_menu.classList.remove('offset-left', 'offset-right');
            }

        }, {
            passive: true
        });

        menu_item.addEventListener('mouseenter', (e) => {

            const bounds = sub_menu.getBoundingClientRect();
            const width = sub_menu.offsetWidth;

            sub_menu.classList.remove('offset-left', 'offset-right');

            if (bounds.left + width > window.innerWidth) {
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

const {state} = store('wpbs/nav-menu', {
    actions: {
        init: () => {

            const {ref: element} = getElement();

            const is_dropdown = element.classList.contains('is-style-dropdown');
            const is_accordion = element.classList.contains('is-style-accordion');

            if (is_dropdown) {
                initDropdown(element);
            }
            if (is_accordion) {
                initAccordion(element);
            }

        }
    },
});