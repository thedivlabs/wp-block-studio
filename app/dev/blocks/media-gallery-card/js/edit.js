import "../scss/block.scss";


import {
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {useInstanceId} from "@wordpress/compose";
import React, {useCallback, useEffect} from "react";
import {
    __experimentalGrid as Grid,
    ToggleControl, SelectControl, TextControl
} from "@wordpress/components";

function blockClassnames(attributes = {}) {
    return [
        'wpbs-media-gallery-card loop-card',
        'w-full block relative',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-media-gallery-card': {
            type: 'object',
            default: {}
        }
    },
    edit: (props) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-media-gallery-card');

        const {attributes, setAttributes, context} = props;

        const updateSettings = useCallback((newValue) => {
            const result = {
                ...attributes['wpbs-media-gallery-card'],
                ...newValue
            };

            setAttributes({
                'wpbs-media-gallery-card': result,
            });
        }, [setAttributes, attributes['wpbs-media-gallery-card']]);

        const blockProps = useBlockProps({
            className: blockClassnames(attributes),
        });

        return (
            <>
                <InspectorControls group="advanced">
                    <Grid columns={2} rowGap={20} style={{'margin-top': '25px'}}>
                        <></>
                    </Grid>
                </InspectorControls>
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>

                <figure {...blockProps}></figure>

                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}/>
            </>
        )
    },
    save: (props) => null
})


