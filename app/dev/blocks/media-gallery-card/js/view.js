import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs/media-gallery-card', {
    actions: {
        init: () => {

            const {ref: block} = getElement();
            const context = JSON.parse(JSON.stringify(getContext()));

            //console.log(context);
            //console.log(block);

            /*
            *
            *  const index = card.dataset.index;

        this.fetchGallery({
            index: index,
            card: card,
            galleryId: data.galleryId,
        }).then(response => response.json())
            .then(result => {
                console.log(result);
            });
            *
            * */

        },
        lightbox: () => {
            const {ref: block} = getElement();
            const context = JSON.parse(JSON.stringify(getContext()));
            const parent = block.closest('.wpbs-media-gallery');
            const data = JSON.parse(parent.querySelector('script.wpbs-args')?.innerText ?? '{}');

            const {index = 0} = context;

            WPBS.lightbox.toggle({
                index: index,
                gallery_id: data?.gallery_id,
            })

        }
    },
});