import '../scss/block.scss';

import {
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls} from "Components/Layout"
import {SLIDER_ATTRIBUTES, SliderControls, sliderArgs, sliderProps} from "Components/Slider"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import Loop from "Components/Loop"
import {
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    __experimentalUnitControl as UnitControl,
    PanelBody,
    SelectControl,
    ToggleControl
} from "@wordpress/components";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useInstanceId} from '@wordpress/compose';


function blockClasses(attributes = {}, editor = false) {

    const {'wpbs-slider': settings} = attributes;

    return [
        'wpbs-slider swiper overflow-hidden w-full relative !flex flex-col',
        attributes.uniqueId,
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
        'wpbs-query': {
            type: 'object',
            default: {}
        }
    },
    edit: ({attributes, setAttributes}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-slider');

        const swiperRef = useRef(null);

        useEffect(() => {

            setAttributes({
                uniqueId: uniqueId,
            });

        }, []);

        const sliderOptions = useMemo(() => {
            return sliderArgs(attributes);
        }, [attributes['wpbs-slider'], uniqueId]);

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

            } else if ('Swiper' in window) {

                new Swiper(swiperRef.current, sliderOptions);
            }
        }, [sliderOptions]);


        const cssProps = sliderProps(attributes);

        const blockProps = useBlockProps({
            ref: swiperRef,
            className: blockClasses(attributes, true)
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/slider-wrapper'],
            ]
        });

        return <>
            <SliderControls attributes={attributes} setAttributes={setAttributes}/>
            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes} props={cssProps}/>

            <div {...innerBlocksProps} />
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

        const innerBlocksProps = useInnerBlocksProps.save(blockProps, {});

        return (
            <div {...innerBlocksProps} />
        );
    }
})


