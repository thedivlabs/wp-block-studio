import "./scss/block.scss";

import {
    BlockContextProvider,
    InnerBlocks,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {useInstanceId} from "@wordpress/compose";
import React, {useEffect} from "react";

function blockClassnames(attributes = {}, is_slider) {
    return [
        'wpbs-media-gallery-container swiper-wrapper loop-container',
        is_slider ? null : 'flex flex-wrap w-full relative',
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

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-media-gallery-container');

        const {type} = context?.['wpbs/settings'] ?? {};
        const is_slider = type === 'slider';

        const blockProps = {
            className: blockClassnames(attributes, is_slider),
        };

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/media-gallery-card'],
            ]
        });


        return (
            <>

                <div {...innerBlocksProps} />

                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId} props={{
                    '--grid-col-gap': 'var(--column-gap, 0px)',
                    '--grid-row-gap': 'var(--row-gap, 0px)',
                }}/>
            </>
        )
    },
    save: () => <InnerBlocks.Content/>
})


