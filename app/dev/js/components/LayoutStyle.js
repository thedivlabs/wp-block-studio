import apiFetch from '@wordpress/api-fetch';


import React, {useState, useEffect} from 'react';

export const LayoutStyle = ({attributes, clientId}) => {
    const [css, setCss] = useState([]);
    const selector = '#block-' + clientId;
    useEffect(() => {
        apiFetch({
            path: '/wpbs/v1/layout-styles/',
            method: 'POST',
            data: {
                attributes: attributes,
                selector: selector
            },
        })
            .then((data) => {
                setCss(data);
            })
    },[attributes]);

    return (
        <style id={'wpbs-layout-styles'} style={{display: 'none'}}>{css}</style>
    );
};
