import {
    useBlockProps,
    InspectorControls,
    BlockEdit,
    InnerBlocks, useInnerBlocksProps
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
import {
    __experimentalGrid as Grid,
    Button,
    PanelBody,
    SelectControl, TextControl,
    ToggleControl,
} from "@wordpress/components";
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

        const innerBlocksProps = useInnerBlocksProps(blockProps);

        return <>
            <BlockEdit key="edit" {...blockProps} />

            <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}
                    clientId={clientId}></Layout>


            <div {...innerBlocksProps}></div>
        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClasses(props.attributes),
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return (
            <div {...innerBlocksProps}></div>
        );
    }
})


