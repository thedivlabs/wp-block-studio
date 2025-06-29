import './scss/block.scss';

import {
    BlockContextProvider,
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "./block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {SLIDER_ATTRIBUTES, SliderControls, sliderArgs, sliderProps} from "Components/Slider"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import {
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    __experimentalUnitControl as UnitControl,
    PanelBody,
    SelectControl, TabPanel,
    ToggleControl
} from "@wordpress/components";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useInstanceId} from '@wordpress/compose';
import {GridControls} from "Components/Grid.js";
import {LoopControls, LOOP_ATTRIBUTES} from "Components/Loop.js";


function blockClasses(attributes = {}, editor = false) {

    const {'wpbs-slider': settings} = attributes;

    return [
        'wpbs-slider swiper overflow-hidden w-full relative !flex flex-col',
        attributes?.uniqueId ?? '',
        !!settings?.collapse ? 'wpbs-slider--collapse' : null,
        !!settings?.['fade-in'] ? 'wpbs-slider--fade-in' : null,
        !!editor ? 'swiper-initialized' : null,
    ].filter(x => x).join(' ');
}


registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        ...SLIDER_ATTRIBUTES,
        ...LOOP_ATTRIBUTES,
    },
    edit: ({attributes, setAttributes}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-slider');

        const swiperRef = useRef(null);

        const sliderOptions = useMemo(() => {
            return sliderArgs(attributes);
        }, [attributes['wpbs-slider']]);

        useEffect(() => {


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
                        ...sliderOptions
                    }).filter(([key]) => allowedParams.includes(key))
                );


                if (swiperRef.current?.swiper?.currentBreakpoint) {
                    swiperRef.current.swiper.currentBreakpoint = null;
                }


                swiperRef.current.swiper.params = Object.assign(swiperRef.current.swiper.params, newParams);

                swiperRef.current.swiper.update();

            } else if ('Swiper' in window && !!swiperRef.current) {
                const element = swiperRef.current;
                console.log(typeof element);
                console.log(swiperRef.current instanceof Element);
                new Swiper(element, sliderOptions);
            }
        }, [sliderOptions]);

        const cssProps = sliderProps(attributes);

        const tabOptions = <SliderControls attributes={attributes} setAttributes={setAttributes}/>;

        const tabLoop = <LoopControls attributes={attributes} setAttributes={setAttributes}/>;

        const tabs = {
            options: tabOptions,
            loop: tabLoop,
        }

        const blockProps = useBlockProps({
            className: blockClasses(attributes, true)
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/slider-wrapper'],
            ]
        });

        const isLoop = (attributes?.className ?? '').includes('is-style-loop');
        const loopQuery = isLoop ? attributes?.['wpbs-query'] ?? {} : {};

        return <>
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
                                name: 'loop',
                                title: 'Loop',
                                className: 'tab-loop'
                            },
                        ]}>
                        {
                            (tab) => (<>{tabs[tab.name]}</>)
                        }
                    </TabPanel>

                </PanelBody>


            </InspectorControls>
            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} props={cssProps} uniqueId={uniqueId}/>

            <BlockContextProvider value={{loopQuery}}>
                <div {...innerBlocksProps} ref={swiperRef}/>
            </BlockContextProvider>
        </>;


    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClasses(props.attributes),
            'data-wp-interactive': 'wpbs/slider',
            'data-wp-init': 'callbacks.observeSlider',
            'data-wp-context': JSON.stringify({
                args: sliderArgs(props.attributes)
            })
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return (
            <div {...innerBlocksProps} />
        );
    }
})


