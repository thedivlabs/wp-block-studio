import {getContext, getElement, store} from '@wordpress/interactivity';

const {state} = store('wpbs/review-content', {
    actions: {
        init: () => {

            const {ref: element} = getElement();

            if (element?.classList.contains('--toggle')) {
                element.addEventListener('click', e => {
                    const card = element.closest('.wpbs-review-card');
                    const text = card && card.querySelector('.wpbs-review-content.--content')?.textContent;

                    if (!text) {
                        return;
                    }

                    const popup = card.cloneNode(true);
                    popup.classList.add('--modal');

                    WPBS.modals.show_modal(false, {
                        template: popup
                    })

                }, {
                    passive: true
                })
            }


        }
    },
});