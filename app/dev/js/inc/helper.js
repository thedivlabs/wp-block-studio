import {useEffect, useState} from '@wordpress/element';
import {select, subscribe} from '@wordpress/data';

export function useResolvedMedia(id) {
    const [media, setMedia] = useState(() =>
        id ? select('core').getMedia(id) : null
    );

    useEffect(() => {
        if (!id) {
            setMedia(null);
            return;
        }

        // load whatever exists right now
        let current = select('core').getMedia(id);
        setMedia(current);

        // subscribe to store changes until the media arrives
        const unsubscribe = subscribe(() => {
            const next = select('core').getMedia(id);
            if (next && next !== current) {
                current = next;
                setMedia(next);
                unsubscribe();
            }
        });

        return unsubscribe;
    }, [id]);

    console.log(media);

    return media;
}
