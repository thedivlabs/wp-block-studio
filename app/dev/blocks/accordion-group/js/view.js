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

            headers.forEach(header => {
                header.addEventListener('click', (e) => {
                    const groupItem = header.closest('.wpbs-accordion-group-item');
                    const content = groupItem.querySelector('.wpbs-accordion-group-content');
                    console.log(groupItem);

                    if (!content) {
                        return;
                    }

                    WPBS.slideToggle(content, 'medium', () => {
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