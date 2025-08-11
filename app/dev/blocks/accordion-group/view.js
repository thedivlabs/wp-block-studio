import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs/accordion-group', {

    actions: {
        init: () => {

            const {ref: component} = getElement();

            if (!component || component.classList.contains('accordion-initialized')) {
                return false;
            }

            component.classList.add('accordion-initialized');


            const headers = component.querySelectorAll('.wpbs-accordion-group-header');

            if (!headers.length) {
                return false;
            }

            const isStatic = component.classList.contains('--static');
            const isSingle = component.classList.contains('is-style-single');

            headers.forEach(header => {
                header.addEventListener('click', (e) => {

                    const groupItem = header.closest('.wpbs-accordion-group-item');
                    const content = groupItem.querySelector('.wpbs-accordion-group-content');

                    if (!content || component.classList.contains('animating') || (isSingle && groupItem.classList.contains('active'))) {
                        return;
                    }

                    if (content.offsetParent !== null) {
                        groupItem.classList.remove('--open');
                    } else {
                        groupItem.classList.add('--open');
                    }

                    component.classList.add('animating');

                    if (isSingle) {
                        const openItems = component.querySelectorAll('.wpbs-accordion-group-item.active');

                        openItems.forEach(item => {

                            const openContent = item.querySelector('.wpbs-accordion-group-content');

                            item.classList.remove('--open');

                            WPBS.slideUp(openContent, 'fast', () => {
                                item.classList.remove('active');
                            })
                        })
                    }

                    WPBS.slideToggle(content, 'fast', () => {
                        if (content.offsetParent !== null) {
                            groupItem.classList.add('active');
                        } else {
                            groupItem.classList.remove('active');
                        }

                        component.classList.remove('animating');
                    })


                })
            })


        }
    }


});