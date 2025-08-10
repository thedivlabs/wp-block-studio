import "./scss/block.scss";

import {
    BlockContextProvider,
    InnerBlocks,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {useInstanceId} from "@wordpress/compose";
import React, {useEffect} from "react";
import {useUniqueId} from "Includes/helper";

function blockClassnames(attributes = {}, is_slider) {
    return [
        'wpbs-media-gallery-container swiper-wrapper loop-container',
        is_slider ? null : 'flex flex-wrap items-start w-full relative',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        ...LAYOUT_ATTRIBUTES,
    },
    edit: ({attributes, setAttributes, clientId, context}) => {

        //const uniqueId = useInstanceId(registerBlockType, 'wpbs-media-gallery-container');

        const uniqueId = useUniqueId(attributes, setAttributes, clientId);

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

        const styleProps = {
            '--grid-col-gap': 'var(--column-gap, 0px)',
            '--grid-row-gap': 'var(--row-gap, 0px)',
        };

        return (
            <>
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                       selector={'wpbs-media-gallery-container'} props={styleProps}/>

                <div {...innerBlocksProps} />

            </>
        )
    },
    save: () => <InnerBlocks.Content/>
})


