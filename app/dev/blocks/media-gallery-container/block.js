import "./scss/block.scss";

import {
    InnerBlocks,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {useInstanceId} from "@wordpress/compose";
import React from "react";

function blockClassnames(attributes = {}, isSlider) {
    return [
        'wpbs-media-gallery-container swiper-wrapper loop-container',
        isSlider ? null : 'flex flex-wrap w-full relative',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES
    },
    edit: ({attributes, setAttributes, clientId, context}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-media-gallery');

        const {isSlider = false} = context;

        const blockProps = {
            className: blockClassnames(attributes, isSlider),
        };

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/media-gallery-card'],
            ]
        });


        return (
            <>

                <div {...innerBlocksProps} />

                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}/>
            </>
        )
    },
    save: () => <InnerBlocks.Content/>
})


