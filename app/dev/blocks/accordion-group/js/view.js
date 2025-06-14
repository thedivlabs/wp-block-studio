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

            headers.forEach(header => {
                header.addEventListener('click', (e) => {
                    const groupItem = header.closest('.wpbs-accordion-group-item');
                    const content = groupItem.querySelector('.wpbs-accordion-group-content');

                    if (!content) {
                        return;
                    }

                    if (content.offsetParent !== null) {
                        groupItem.classList.remove('--open');
                    } else {
                        groupItem.classList.add('--open');
                    }

                    WPBS.slideToggle(content, (!isStatic ? 'medium' : 0), () => {
                        if (content.offsetParent !== null) {
                            groupItem.classList.add('active');
                        } else {
                            groupItem.classList.remove('active');
                        }
                    })


                })
            })


        }
    }


});