import {store, getElement, getContext} from '@wordpress/interactivity';


const {state} = store('wpbs/media-gallery', {
    actions: {
        init: () => {

            const {ref: grid} = getElement();
            const data = JSON.parse(grid.querySelector('script.wpbs-media-gallery-args')?.innerHTML ?? '{}');

            const {is_last} = data;
            console.log(grid);

            WPBS.setMasonry(grid);

            WPBS.gridDividers(grid, data);


        },
    },
});