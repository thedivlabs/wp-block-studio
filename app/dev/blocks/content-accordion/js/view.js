import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs/content-accordion', {

    actions: {
        init: () => {

            const {ref: component} = getElement();

            if (component.classList.contains('accordion-initialized')) {
                return false;
            }

            component.classList.add('accordion-initialized');


        }
    }


});