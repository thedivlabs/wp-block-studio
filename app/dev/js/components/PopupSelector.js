// Components/PopupSelector.js

import { useMemo } from '@wordpress/element';
import { SelectControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

export default function PopupSelector({
                                          value = '',
                                          onChange = () => {},
                                          label = 'Popup',
                                      }) {

    // Stable query object
    const QUERY = useMemo(() => ({ per_page: -1 }), []);

    // Fetch popup posts
    const popups = useSelect(
        (select) =>
            select(coreStore).getEntityRecords('postType', 'popup', QUERY),
        [QUERY]
    ) || [];

    // Build options list
    const options = useMemo(() => {
        return [
            { label: 'Select', value: '' },
            ...popups.map((popup) => ({
                label: popup.title?.raw || '(Untitled)',
                value: popup.id,
            })),
        ];
    }, [popups]);

    return (
        <SelectControl
            label={label}
            __nextHasNoMarginBottom
            value={value}
            options={options}
            onChange={(newValue) => onChange(newValue)}
        />
    );
}