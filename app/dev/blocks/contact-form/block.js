import "./scss/block.scss";

import {
    useBlockProps,
    InspectorControls, PanelColorSettings
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useUniqueId} from "Includes/helper";
import apiFetch from '@wordpress/api-fetch';


function blockClassNames(attributes = {}) {

    const {'wpbs-contact-form': settings = {}} = attributes;

    return [
        'wpbs-contact-form wpbs-has-container flex flex-wrap',
        attributes?.uniqueId ?? null
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-contact-form': {
            type: 'object',
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {'wpbs-contact-form': settings = {}} = attributes;

        const [forms, setForms] = useState([]);

        useEffect(() => {
            apiFetch({path: '/gf/v2/forms'})
                .then((response) => {
                    setForms(response); // response is an array of form objects
                })
                .catch((error) => {
                    console.error('Error fetching forms:', error);
                });
        }, []);
        
        const updateSettings = useCallback((newValue) => {

            const result = {
                ...settings,
                ...newValue,
            }

            setAttributes({'wpbs-contact-form': result});

        }, [settings, setAttributes]);

        const blockProps = useBlockProps({
            className: blockClassNames(attributes),
        });


        return <>


            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                   selector={'wpbs-contact-form'} deps={['wpbs-contact-form']}/>

            <div {...blockProps}>FORM</div>
        </>

    },
    save: () => {
        return null;
    }
})


