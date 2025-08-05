import "./scss/block.scss";


import {
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {useInstanceId} from "@wordpress/compose";
import React, {useCallback, useEffect} from "react";
import {
    __experimentalGrid as Grid,
    ToggleControl, SelectControl, TextControl
} from "@wordpress/components";
import {useUniqueId} from "Includes/helper";

function blockClassnames(attributes = {}, is_slider = false) {
    return [
        'wpbs-media-gallery-card loop-card',
        'w-full block relative',
        !!is_slider ? 'swiper-slide' : 'loop-card',
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
    edit: ({attributes, setAttributes, context = {}, clientId}) => {

        //const uniqueId = useInstanceId(registerBlockType, 'wpbs-media-gallery-card');

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

        const {type} = context?.['wpbs/settings'] ?? {};
        const is_slider = type === 'slider';

        const blockProps = useBlockProps({
            className: blockClassnames(attributes, is_slider),
        });

        return (
            <>

                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}/>

                <div {...blockProps}></div>

            </>
        )
    },
    save: (props) => null
})


