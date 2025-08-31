import {getElement, store} from '@wordpress/interactivity';

const searchFieldHandler = (searchInput, params) => {
    const value = searchInput.value.trim();
    if (value) params.set('s', value);
    else params.delete('s');

    window.location.search = params.toString();
}

const sortFieldHandler = (sortSelect, params) => {
    const value = sortSelect.value;
    if (value) {
        params.set('sort', value)
    } else {
        params.delete('sort')
    }

    window.location.search = params.toString();
}

const {state} = store('wpbs/archive-filters', {
    actions: {
        init: () => {

            const {ref: block} = getElement();

            if (!block) return;

            const type = block.dataset?.type;
            const params = new URLSearchParams(window.location.search);

            switch (type) {
                case 'search':
                    const searchInput = block.querySelector('input[type="text"]');
                    const searchButton = block.querySelector('button.wpbs-archive-filters__submit');
                
                    if (searchButton) {


                        searchButton.addEventListener('click', () => {
                            searchFieldHandler(searchInput, params);
                        });
                    }
                    if (searchInput) {
                        searchInput.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                searchFieldHandler(searchInput, params);
                            }
                        });
                    }
                    break;
                case 'sort':
                    const sortSelect = block.querySelector('select');
                    if (sortSelect) {
                        const sortValue = params.get('sort') || '';

                        if (sortValue) {
                            const optionExists = Array.from(sortSelect.options).some(opt => opt.value === sortValue);
                            if (optionExists) sortSelect.value = sortValue;
                        }
                    }

                    if (sortSelect) {

                        sortSelect.addEventListener('change', () => {
                            sortFieldHandler(sortSelect, params);
                        });
                    }
                    break;
                case 'terms':
                    const termSelect = block.querySelector('select');

                    if (termSelect) {
                        termSelect.addEventListener('change', () => {
                            if (termSelect.value) {
                                window.location.href = termSelect.value;
                            }
                        });
                    }
                    break;

            }


        },
    },
});
