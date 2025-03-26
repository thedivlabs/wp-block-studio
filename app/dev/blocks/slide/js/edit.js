import '../scss/block.scss';

import {
    useBlockProps,
    InspectorControls,
    BlockEdit,
    InnerBlocks
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
        'wpbs-slide swiper-slide flex',
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

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-video');

        useEffect(() => {
            setAttributes({uniqueId: uniqueId});
        }, []);

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
        });

        return <>
            <BlockEdit key="edit" {...blockProps} />
            <InspectorControls group="styles">
                <PanelBody initialOpen={true}>
                    <Grid columns={1} columnGap={15} rowGap={20}>

                    </Grid>
                </PanelBody>
            </InspectorControls>

            <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}
                    clientId={clientId}></Layout>


            <div {...blockProps} >
                <InnerBlocks/>
            </div>
        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClasses(props.attributes),
        });

        return (
            <div {...blockProps} >
                <InnerBlocks.Content/>
            </div>
        );
    }
})


