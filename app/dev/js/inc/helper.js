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