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
        'wpbs-slider-wrapper swiper-wrapper',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const blockProps = useBlockProps({
            className: blockClasses(attributes),
        });

       /* const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                [ 'wpbs/slide', { content: 'Content Slide' } ],
            ]
        });*/

        return <>
            <BlockEdit key="edit" {...blockProps} />

            <div {...blockProps}>
                <InnerBlocks/>
            </div>
        </>;
    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClasses(props.attributes),
        });

        //const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return (
            <div {...blockProps}>
                <InnerBlocks.Content/>
            </div>
        );
    }
})


