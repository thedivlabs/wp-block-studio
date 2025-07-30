[...document.querySelectorAll('.divlabs-menu__menu > li:has(> .sub-menu)')].forEach((menu_item) => {

    const menu = menu_item.closest('.divlabs-menu');
    const type = menu && 'type' in menu.dataset ? menu_item.closest('.divlabs-menu').dataset.type : false;
    const link = menu_item.querySelector(':scope > a');
    const sub_menu = menu_item.querySelector(':scope > ul.sub-menu');

    if (type === 'dropdown') {
        menu_item.addEventListener('mouseenter', (e) => {
            if (window.matchMedia("(min-width: 720px)")) {
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
            }
        }, {
            passive: true
        });
    }

    if (type === 'accordion' && link) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            $(sub_menu).slideToggle('fast');
            $(menu_item).toggleClass('active');
        });
    }


});