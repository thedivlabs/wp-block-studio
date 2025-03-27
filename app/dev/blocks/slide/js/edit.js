import {
    useBlockProps,
    BlockEdit,
    useInnerBlocksProps, InspectorControls
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {Background, BackgroundSettings, BackgroundAttributes} from "Components/Background";

import React, {useEffect, useState} from "react";
import {useInstanceId} from '@wordpress/compose';

function blockClasses(attributes = {}) {
    return [
        'wpbs-slide swiper-slide !h-auto grow w-full flex',
        attributes.uniqueId,
        LayoutClasses(attributes)
    ].filter(x => x).join(' ');
}

const blockAttributes = {
    'wpbs-title': {
        type: 'string'
    },
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LayoutAttributes,
        ...BackgroundAttributes,
        ...blockAttributes
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const [title, setTitle] = useState(attributes['wpbs-title']);

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-slide');

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});
        }, []);

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
        });

        const innerBlocksProps = useInnerBlocksProps({}, {
            className: 'wpbs-slide__container wpbs-container',
        });

        return <>
            <BlockEdit key="edit" {...blockProps} />

            <InspectorControls group="styles">
                <BackgroundSettings attributes={attributes || {}}
                                    pushSettings={setAttributes}></BackgroundSettings>
            </InspectorControls>
            <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}
                    clientId={clientId}></Layout>

            <div {...blockProps}>
                <div {...innerBlocksProps}></div>
                <Background attributes={attributes} editor={true}/>
            </div>

        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClasses(props.attributes),
        });

        const innerBlocksProps = useInnerBlocksProps.save({}, {
            className: 'wpbs-slide__container wpbs-container',
        });

        return (

            <div {...blockProps}>
                <div {...innerBlocksProps}></div>
                <Background attributes={props.attributes}/>
            </div>
        );
    }
})


