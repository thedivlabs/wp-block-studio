import "./scss/block.scss";


import {
    InnerBlocks,
    InspectorControls, PanelColorSettings,
    useBlockProps,
    useInnerBlocksProps,
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {GRID_ATTRIBUTES, GridControls, gridProps} from "Components/Grid"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {useInstanceId} from "@wordpress/compose";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
    __experimentalGrid as Grid,
    ToggleControl,
    SelectControl,
    TextControl,
    BaseControl,
    __experimentalNumberControl as NumberControl,
    __experimentalBorderControl as BorderControl,
    __experimentalInputControl as InputControl,
    __experimentalUnitControl as UnitControl, PanelBody, TabPanel
} from "@wordpress/components";
import Breakpoint from "Components/Breakpoint.js";
import {MediaGalleryControls, MEDIA_GALLERY_ATTRIBUTES} from "Components/MediaGallery.js";
import {SLIDER_ATTRIBUTES, SliderControls, sliderArgs, sliderProps} from "Components/Slider"

function blockClassnames(attributes = {}) {
    return [
        'wpbs-media-gallery h-max',
        'flex flex-wrap w-full block relative',
        attributes?.uniqueId ?? '',
    ].filter(x => x).join(' ');
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        ...GRID_ATTRIBUTES,
        ...MEDIA_GALLERY_ATTRIBUTES,
        ...SLIDER_ATTRIBUTES,
        'wpbs-swiper-args': {
            type: 'object'
        }
    },
    edit: ({attributes, setAttributes}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-media-gallery');

        const tabOptions = <GridControls attributes={attributes} setAttributes={setAttributes}/>;

        const tabSlider = <SliderControls attributes={attributes} setAttributes={setAttributes}/>;

        const tabGallery = <MediaGalleryControls attributes={attributes} setAttributes={setAttributes}/>;

        const tabs = {
            options: tabOptions,
            gallery: tabGallery,
            slider: tabSlider,
        }

        const sliderOptions = useMemo(() => {
            return sliderArgs(attributes);
        }, [attributes['wpbs-slider']]);

        useEffect(() => {
            setAttributes({'wpbs-swiper-args': sliderOptions});
        }, [sliderOptions]);

        const cssProps = useMemo(() => {
            return {
                ...gridProps(attributes),
                ...sliderProps(attributes)
            };
        }, [attributes]);

        const blockProps = useBlockProps({
            className: blockClassnames(attributes),
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/media-gallery-card'],
            ]
        });

        return (
            <>
                <InspectorControls group="styles">

                    <PanelBody>

                        <TabPanel
                            className="wpbs-editor-tabs"
                            activeClass="active"
                            orientation="horizontal"
                            initialTabName="options"
                            tabs={[
                                {
                                    name: 'options',
                                    title: 'Options',
                                    className: 'tab-options',
                                },
                                {
                                    name: 'gallery',
                                    title: 'Gallery',
                                    className: 'tab-gallery',
                                },
                                {
                                    name: 'slider',
                                    title: 'Slider',
                                    className: 'tab-slider',
                                },
                            ]}>
                            {
                                (tab) => (<>{tabs[tab.name]}</>)
                            }
                        </TabPanel>

                    </PanelBody>


                </InspectorControls>
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>

                <div {...innerBlocksProps}></div>

                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                       deps={['wpbs-grid']}
                       props={cssProps}
                />
            </>
        )
    },
    save: () => {

        return <InnerBlocks.Content/>;
    }
})


