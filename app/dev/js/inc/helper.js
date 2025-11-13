import {useEffect, useState} from '@wordpress/element';
import {select, dispatch} from '@wordpress/data';

export function useResolvedMedia(id) {
    const [media, setMedia] = useState(null);

    useEffect(() => {
        if (!id) {
            setMedia(null);
            return;
        }

        const existing = select('core').getMedia(id);
        if (existing) {
            setMedia(existing);
        } else {
            dispatch('core')
                .fetchMedia(id)
                .then((m) => setMedia(m))
                .catch(() => setMedia(null));
        }
    }, [id]);

    return media;
}
