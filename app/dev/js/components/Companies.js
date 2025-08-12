import {FormTokenField} from '@wordpress/components';
import {useSelect} from '@wordpress/data';
import {useMemo} from '@wordpress/element';

export function Companies({value = [], callback}) {

    // Fetch all company posts
    const companies = useSelect((select) => {
        return select('core').getEntityRecords('postType', 'company', {per_page: -1});
    }, []);
    
    // Create a map for easy label → ID lookup
    const {options, labelToId} = useMemo(() => {
        const opts = (companies || []).map(post => post.title.rendered);
        const map = {};
        (companies || []).forEach(post => {
            map[post.title.rendered] = String(post.id);
        });
        return {options: opts, labelToId: map};
    }, [companies]);

    // Convert stored IDs into labels for FormTokenField
    const selectedLabels = useMemo(() => {
        if (!Array.isArray(value)) return [];
        const idToLabel = Object.fromEntries(
            (companies || []).map(post => [String(post.id), post.title.rendered])
        );
        return value.map(id => idToLabel[id]).filter(Boolean);
    }, [value, companies]);

    return (
        <FormTokenField
            label="Select Companies"
            value={selectedLabels}
            __experimentalExpandOnFocus={true}
            suggestions={options}
            onChange={(newLabels) => {
                // Map labels back to IDs
                const newIds = newLabels
                    .map(label => labelToId[label])
                    .filter(Boolean);
                callback(newIds);
            }}
        />
    );
}
