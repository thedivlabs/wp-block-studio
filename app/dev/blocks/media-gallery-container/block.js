import "./scss/block.scss";

import {
    BlockContextProvider,
    InnerBlocks,
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {GRID_ATTRIBUTES, GridControls, gridProps} from "Components/Grid"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {useInstanceId} from "@wordpress/compose";
import React, {useMemo, useRef} from "react";
import {
    PanelBody, TabPanel
} from "@wordpress/components";
import {MediaGalleryControls, MEDIA_GALLERY_ATTRIBUTES} from "Components/MediaGallery.js";
import {SLIDER_ATTRIBUTES, SliderControls, sliderProps, SliderComponent} from "Components/Slider"

function blockClassnames(attributes = {}, isSlider = false) {
    return [
        'wpbs-media-gallery-container',
        'flex flex-wrap w-full relative',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
    },
    edit: ({attributes, setAttributes, clientId, context}) => {

        console.log(context);


        const blockProps = {
            className: blockClassnames(attributes),
        };

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/media-gallery-card'],
            ]
        });


        return (
            <>

                <div {...innerBlocksProps} />

            </>
        )
    },
    save: () => <InnerBlocks.Content/>
})


