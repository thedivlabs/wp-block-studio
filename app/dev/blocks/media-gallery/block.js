import "./scss/block.scss";

import {
    BlockContextProvider,
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
import React, {useEffect, useMemo, useRef, useState} from "react";
import {
    PanelBody, TabPanel
} from "@wordpress/components";
import {MediaGalleryControls, MEDIA_GALLERY_ATTRIBUTES} from "Components/MediaGallery.js";
import {SLIDER_ATTRIBUTES, sliderArgs, SliderControls, sliderProps} from "Components/Slider"

function blockClassnames(attributes = {}, isSlider = false) {
    return [
        'wpbs-media-gallery h-max',
        'flex flex-wrap w-full block relative',
        isSlider ? 'swiper' : null,
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
        ...SLIDER_ATTRIBUTES
    },
    edit: ({attributes, setAttributes}) => {

        const isSlider = (attributes?.className ?? '').includes('is-style-slider');
        
        const swiperRef = useRef(null);

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-media-gallery');

        useEffect(() => {

            console.log(attributes?.['wpbs-swiper-args']);

            if (swiperRef.current?.swiper) {

                const allowedParams = [
                    'breakpoints',
                    'slidesPerView',
                    //'rewind',
                    'slidesPerGroup',
                    'spaceBetween',
                ];

                const newParams = Object.fromEntries(
                    Object.entries({
                        ...swiperRef.current.swiper.params,
                        ...attributes?.['wpbs-swiper-args'] ?? {}
                    }).filter(([key]) => allowedParams.includes(key))
                );


                if (swiperRef.current?.swiper?.currentBreakpoint) {
                    swiperRef.current.swiper.currentBreakpoint = null;
                }


                swiperRef.current.swiper.params = Object.assign(swiperRef.current.swiper.params, newParams);

                swiperRef.current.swiper.update();

            } else if ('Swiper' in window && swiperRef.current) {
                const element = swiperRef.current;
                const swiper = new Swiper(element, {
                    ...attributes?.['wpbs-swiper-args'] ?? {},
                });
            }
        }, [attributes?.['wpbs-swiper-args']]);

        const tabGrid = <GridControls attributes={attributes} setAttributes={setAttributes}/>;

        const tabSlider = <SliderControls attributes={attributes} setAttributes={setAttributes}/>;

        const tabGallery = <MediaGalleryControls attributes={attributes} setAttributes={setAttributes}/>;

        const tabsContent = {
            gallery: tabGallery,
            grid: tabGrid,
            slider: tabSlider,
        }

        const visibleTabs = [
            {
                name: 'gallery',
                title: 'Gallery',
                className: 'tab-gallery',
            },
            !isSlider && {
                name: 'grid',
                title: 'Grid',
                className: 'tab-grid',
            },
            !!isSlider && {
                name: 'slider',
                title: 'Slider',
                className: 'tab-slider',
            }
        ].filter(Boolean); // removes false entries

        const cssProps = !isSlider ? gridProps(attributes) : sliderProps(attributes);

        const baseProps = {
            className: blockClassnames(attributes, isSlider),
        };

        const blockProps = isSlider
            ? useBlockProps({...baseProps, ref: swiperRef})
            : useBlockProps(baseProps);

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
                            initialTabName={visibleTabs[0]?.name}
                            tabs={visibleTabs}
                        >
                            {(tab) => <>{tabsContent[tab.name]}</>}
                        </TabPanel>
                    </PanelBody>


                </InspectorControls>
                <LayoutControls attributes={attributes} setAttributes={setAttributes}/>

                <BlockContextProvider value={{isSlider}}>
                    {
                        isSlider ? <div {...blockProps}>
                            <div className="swiper-wrapper">
                                {innerBlocksProps.children}
                                <div className={'swiper-slide'}/>
                                <div className={'swiper-slide'}/>
                                <div className={'swiper-slide'}/>
                                <div className={'swiper-slide'}/>
                                <div className={'swiper-slide'}/>
                            </div>
                        </div> : <div {...innerBlocksProps} />
                    }
                </BlockContextProvider>


                <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId}
                       deps={['wpbs-grid', 'wpbs-slider']}
                       props={cssProps}
                />
            </>
        )
    },
    save: () => {

        return <InnerBlocks.Content/>;
    }
})


