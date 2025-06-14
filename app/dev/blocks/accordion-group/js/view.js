import {store, getElement, getContext} from '@wordpress/interactivity';

function slideToggle(element, duration = 300) {
    if (!element) return;

    element.style.overflow = 'hidden';
    element.style.transition = `max-height ${duration}ms ease`;

    if (element.offsetHeight > 0) {
        // Slide up
        element.style.maxHeight = element.scrollHeight + 'px'; // set to full height first
        requestAnimationFrame(() => {
            element.style.maxHeight = '0';
        });
    } else {
        // Slide down
        element.style.maxHeight = '0';
        requestAnimationFrame(() => {
            element.style.maxHeight = element.scrollHeight + 'px';
        });
    }
}

const {state} = store('wpbs/accordion-group', {

    actions: {
        init: () => {

            const {ref: component} = getElement();

            if (!component || component.classList.contains('accordion-initialized')) {
                return false;
            }

            component.classList.add('accordion-initialized');

            console.log(component);

            const headers = component.querySelectorAll('.wpbs-accordion-group-header');

            if (!headers.length) {
                return false;
            }

            headers.forEach(header => {
                header.addEventListener('click', (e) => {

                    const groupItem = header.closest('.wpbs-accordion-group-item');
                    const content = groupItem.querySelector('.wpbs-accordion-group-content');

                    if (!content) {
                        return;
                    }

                    slideToggle(content, 300);

                    if (content.offsetParent !== null) {
                        groupItem.classList.add('active');
                    } else {
                        groupItem.classList.remove('active');
                    }

                })
            })


        }
    }


});