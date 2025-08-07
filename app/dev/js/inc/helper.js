import {useEffect} from 'react';
import {select, useSelect} from '@wordpress/data';


export const imageButtonStyle = {
    border: '1px dashed lightgray',
    width: '100%',
    height: 'auto',
    aspectRatio: '16/9',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
}

export function cleanObject(obj) {
    if (Array.isArray(obj)) {
        return obj
            .map(cleanObject)
            .filter(v => v != null && v !== '' && !(typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length));
    }

    if (typeof obj === 'object' && obj !== null) {
        return Object.fromEntries(
            Object.entries(obj)
                .map(([k, v]) => [k, cleanObject(v)])
                .filter(([_, v]) =>
                    v != null &&
                    v !== '' &&
                    !(Array.isArray(v) && v.length === 0) &&
                    !(typeof v === 'object' && Object.keys(v).length === 0)
                )
        );
    }

    return obj;
}


function getAllBlocks(blocks) {
    return blocks.reduce((all, block) => {
        all.push(block);
        if (block.innerBlocks.length) {
            all.push(...getAllBlocks(block.innerBlocks));
        }
        return all;
    }, []);
}


export function useUniqueId(attributes, setAttributes, clientId, prefix = 'block') {
    useEffect(() => {
        const hasId = !!attributes.uniqueId;

        const allTopBlocks = select('core/block-editor').getBlocks();
        const allBlocks = getAllBlocks(allTopBlocks);

        const isDuplicate = allBlocks.some((block) => {

            return block.clientId !== clientId && block.attributes?.uniqueId === attributes.uniqueId;
        });

        if (!hasId || isDuplicate) {
            const newId = `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
            setAttributes({uniqueId: newId});
        }
    }, [attributes.uniqueId, setAttributes, clientId, prefix]);

    return attributes.uniqueId;
}
