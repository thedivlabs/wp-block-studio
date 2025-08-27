import {getElement, store} from '@wordpress/interactivity';

const {state} = store('wpbs/archive-filters', {
    actions: {
        init: () => {

            const {ref: block} = getElement();

            if (!block) return;

            const searchInput = block.querySelector('input[type="text"]');
            const searchButton = block.querySelector('button.wpbs-archive-filters__submit');
            const params = new URLSearchParams(window.location.search);

            // Sort select
            const sortSelect = block.querySelector('select');

            if (sortSelect) {
                const sortValue = params.get('sort') || '';

                // Set the dropdown value if it exists
                if (sortValue) {
                    const optionExists = Array.from(sortSelect.options).some(opt => opt.value === sortValue);
                    if (optionExists) sortSelect.value = sortValue;
                }
            }

            const reloadWithQuery = () => {


                // Update search
                if (searchInput) {
                    const value = searchInput.value.trim();
                    if (value) params.set('s', value);
                    else params.delete('s');
                }

                // Update sort
                if (sortSelect) {
                    const value = sortSelect.value;
                    if (value) params.set('sort', value);
                    else params.delete('sort');
                }

                // Reload page with updated query string
                window.location.search = params.toString();
            };

            // Submit on search button click
            if (searchButton) {
                searchButton.addEventListener('click', reloadWithQuery);
            }

            // Submit on Enter key in search input
            if (searchInput) {
                searchInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        reloadWithQuery();
                    }
                });
            }

            // Submit on sort select change
            if (sortSelect) {
                sortSelect.addEventListener('change', reloadWithQuery);
            }

        },
    },
});
