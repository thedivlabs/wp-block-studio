import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs/faq-group', {

    actions: {
        init: () => {

            const {ref: component} = getElement();

            if (!component || component.classList.contains('accordion-initialized') || !component.classList.contains('is-style-accordion')) {
                return false;
            }

            component.classList.add('accordion-initialized');


            const headers = component.querySelectorAll('.wpbs-faq-header');

            if (!headers.length) {
                return false;
            }

            const isSingle = component.classList.contains('--single');

            headers.forEach(header => {
                header.addEventListener('click', () => {
                    const groupItem = header.closest('.wpbs-faq-item');
                    const content = groupItem.querySelector('.wpbs-faq-content');

                    if (!content || component.classList.contains('animating')) return;

                    const isOpen = groupItem.classList.contains('active');

                    // ----- SINGLE MODE: close all others before toggling -----
                    if (isSingle) {
                        const others = component.querySelectorAll('.wpbs-faq-item.active');

                        others.forEach(item => {
                            if (item === groupItem) return;

                            const otherContent = item.querySelector('.wpbs-faq-content');

                            item.classList.remove('--open');
                            WPBS.slideUp(otherContent, 'fast', () => {
                                item.classList.remove('active');
                            });
                        });
                    }

                    // If clicking on the open item in single mode → do nothing
                    if (isSingle && isOpen) return;

                    // ----- Toggle this item -----
                    component.classList.add('animating');

                    if (isOpen) {
                        groupItem.classList.remove('--open');
                    } else {
                        groupItem.classList.add('--open');
                    }

                    WPBS.slideToggle(content, 'fast', () => {
                        if (content.offsetParent !== null) {
                            groupItem.classList.add('active');
                        } else {
                            groupItem.classList.remove('active');
                        }
                        component.classList.remove('animating');
                    });
                });

            })


        }
    }


});