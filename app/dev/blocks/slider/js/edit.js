import '../scss/block.scss';

import {
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls, layoutCss} from "Components/Layout"
import {Style, STYLE_ATTRIBUTES} from "Components/Style"
import Loop from "Components/Loop"
import {SWIPER_OPTIONS_DEFAULT} from 'Includes/helper'
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


function blockClasses(attributes = {}) {

    const {'wpbs-slider': sliderArgs} = attributes;

    return [
        'wpbs-slider swiper overflow-hidden w-full relative !flex flex-col',
        attributes.uniqueId,
        !!sliderArgs.collapse ? 'wpbs-slider--collapse' : null,
    ].filter(x => x).join(' ');
}

function cleanArgs(obj) {
    if (Array.isArray(obj)) {
        return obj
            .map(cleanArgs)
            .filter((val) => val !== undefined && val !== null && val !== '');
    }

    if (typeof obj === 'object' && obj !== null) {
        return Object.fromEntries(
            Object.entries(obj)
                .map(([key, value]) => [key, cleanArgs(value)])
                .filter(([, value]) => value !== undefined && value !== null && value !== '')
        );
    }

    return obj;
}

function getArgs(attributes) {

    const {'wpbs-slider': options} = attributes;

    const breakpoint = attributes.breakpoint || 992;

    let args = {
        slidesPerView: options['slides-mobile'] || options['slides-large'] || 1,
        slidesPerGroup: options['group-mobile'] || options['group-large'] || 1,
        spaceBetween: options['margin-mobile'] || options['margin-large'] ? (options['margin-mobile'] || options['margin-large']).replace('px', '') : null,
        autoplay: options['autoplay'] ? {
            delay: options['autoplay'] * 1000,
            pauseOnMouseEnter: !!options['hover-pause']
        } : false,
        speed: options['transition'] ? options['transition'] * 100 : null,
        pagination: options['pagination'] ? {
            enabled: true,
            el: '.swiper-pagination',
            type: options['pagination']
        } : false,
        effect: options['effect'] || 'slide',
        freeMode: !!options['effect'],
        centeredSlides: !!options['centered'],
        loop: !!options['loop'],
        rewind: !!options['loop'] ? false : !!options['rewind'],
        initialSlide: !!options['from-end'] ? 99 : null,
        breakpoints: {}
    };

    let breakpointArgs = {
        slidesPerView: options['slides-mobile'] && options['slides-large'] ? options['slides-large'] : null,
        slidesPerGroup: options['group-mobile'] && options['group-large'] ? options['group-large'] : null,
        spaceBetween: options['margin-mobile'] && options['margin-large'] ? options['margin-large'] : null,
    };

    if (!!options['collapse']) {
        args.enabled = false;
        breakpointArgs.enabled = true;
    }

    args = Object.fromEntries(
        Object.entries(args)
            .filter(([_, value]) => value !== null));

    breakpointArgs = Object.fromEntries(
        Object.entries(breakpointArgs)
            .filter(([_, value]) => value !== null));

    args.breakpoints[breakpoint] = {
        ...breakpointArgs
    };


    return {
        ...SWIPER_OPTIONS_DEFAULT,
        ...args
    };
}

function getCssProps(attributes) {
    const breakpoint = WPBS?.settings?.breakpoints?.[attributes?.['wpbs-layout']?.['breakpoint'] ?? 'normal'];

    return cleanArgs({
        '--slides': attributes['wpbs-slider']?.['slides-mobile'] ?? attributes['wpbs-slider']?.['slides-large'] ?? 1,
        breakpoints: {
            [breakpoint]: {
                '--slides': attributes['wpbs-slider']?.['slides-large'] ?? null,
            }
        }
    });
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-query': {
            type: 'object',
            default: {}
        },
        'wpbs-slider': {
            type: 'object',
            default: {
                'slides-mobile': undefined,
                'slides-large': undefined,
                'group-mobile': undefined,
                'group-large': undefined,
                'margin-mobile': undefined,
                'margin-large': undefined,
                'autoplay': undefined,
                'transition': undefined,
                'effect': undefined,
                'hover-pause': undefined,
                'centered': undefined,
                'collapse': undefined,
                'loop': undefined,
                'dim': undefined,
                'from-end': undefined,
                'rewind': undefined,
                'swiperArgs': undefined,
            }
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-slider');

        const swiperRef = useRef(null);

        useEffect(() => {

            setAttributes({
                uniqueId: uniqueId,
            });

        }, []);

        const sliderOptions = useMemo(() => {
            return getArgs(attributes);
        }, [attributes['wpbs-slider'], uniqueId]);

        useEffect(() => {

            //delete (sliderOptions.on);

            if (!!swiperRef.current?.swiper) {
                swiperRef.current.swiper.destroy(true, true);
            }

            if ('Swiper' in window) {
                const swiper = new Swiper(swiperRef.current, sliderOptions);
            }

        }, [sliderOptions]);

        const cssProps = useMemo(() => {
            return getCssProps(attributes);
        }, [attributes['wpbs-layout']?.['breakpoint'], attributes['wpbs-slider'], uniqueId]);

        const blockProps = useBlockProps({
            className: blockClasses(attributes)
        });

        const updateOptions = useCallback((key) => (newValue) => {
            setAttributes((prev) => {
                const next = {
                    ...prev['wpbs-slider'],
                    [key]: newValue,
                };
                return {
                    'wpbs-slider': next
                };
            });
        }, []);

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            className: 'swiper-wrapper grow flex',
            template: [
                ['wpbs/slider-wrapper'],
            ]
        });


        return <>
            <InspectorControls group="styles">
                <PanelBody initialOpen={true}>
                    <Grid columns={1} columnGap={15} rowGap={20}>
                        <Grid columns={2} columnGap={15} rowGap={20}>
                            <NumberControl
                                label={'Slides Mobile'}
                                __next40pxDefaultSize
                                isShiftStepEnabled={true}
                                onChange={updateOptions('slides-mobile')}
                                value={attributes['wpbs-slider']['slides-mobile']}
                            />
                            <NumberControl
                                label={'Slides Large'}
                                __next40pxDefaultSize
                                isShiftStepEnabled={true}
                                onChange={updateOptions('slides-large')}
                                value={attributes['wpbs-slider']['slides-large']}
                            />
                            <NumberControl
                                label={'Group Mobile'}
                                __next40pxDefaultSize
                                isShiftStepEnabled={true}
                                onChange={updateOptions('group-mobile')}
                                value={attributes['wpbs-slider']['group-mobile']}
                            />
                            <NumberControl
                                label={'Group Large'}
                                __next40pxDefaultSize
                                isShiftStepEnabled={true}
                                onChange={updateOptions('group-large')}
                                value={attributes['wpbs-slider']['group-large']}
                            />
                            <NumberControl
                                label={'Autoplay'}
                                __next40pxDefaultSize
                                isShiftStepEnabled={true}
                                onChange={updateOptions('autoplay')}
                                value={!!attributes['wpbs-slider']['autoplay']}
                                step={1}
                            />
                            <NumberControl
                                label={'Transition'}
                                __next40pxDefaultSize
                                isShiftStepEnabled={true}
                                onChange={updateOptions('transition')}
                                value={attributes['wpbs-slider']['transition']}
                                step={1}
                            />
                            <UnitControl
                                label={'Margin Mobile'}
                                isResetValueOnUnitChange={true}
                                units={[
                                    {value: 'px', label: 'px', default: 0},
                                ]}
                                __next40pxDefaultSize
                                onChange={updateOptions('margin-mobile')}
                                value={attributes['wpbs-slider']['margin-mobile']}
                            />
                            <UnitControl
                                label={'Margin Large'}
                                isResetValueOnUnitChange={true}
                                units={[
                                    {value: 'px', label: 'px', default: 0},
                                ]}
                                __next40pxDefaultSize
                                onChange={updateOptions('margin-large')}
                                value={attributes['wpbs-slider']['margin-large']}
                            />


                            <SelectControl
                                label={'Pagination'}
                                options={[
                                    {label: 'Default', value: 'none'},
                                    {label: 'Progress Bar', value: 'progressbar'},
                                    {label: 'Bullets', value: 'bullets'},
                                ]}
                                onChange={updateOptions('pagination')}
                                value={attributes['wpbs-slider']['pagination']}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                            <SelectControl
                                label={'Effect'}
                                options={[
                                    {label: 'Default', value: ''},
                                    {label: 'Fade', value: 'fade'},
                                    {label: 'Flip', value: 'flip'},
                                ]}
                                onChange={updateOptions('effect')}
                                value={attributes['wpbs-slider']['effect']}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                        </Grid>

                        <Grid columns={2} columnGap={15} rowGap={20}
                              style={{padding: '1rem 0'}}>
                            <ToggleControl
                                label="Hover Pause"
                                onChange={updateOptions('hover-pause')}
                                checked={!!attributes['wpbs-slider']['hover-pause']}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                            <ToggleControl
                                label="Free Mode"
                                onChange={updateOptions('free-mode')}
                                checked={!!attributes['wpbs-slider']['free-mode']}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                            <ToggleControl
                                label="Centered"
                                onChange={updateOptions('centered')}
                                checked={!!attributes['wpbs-slider']['centered']}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                            <ToggleControl
                                label="Collapse"
                                onChange={updateOptions('collapse')}
                                checked={!!attributes['wpbs-slider']['collapse']}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                            <ToggleControl
                                label="Loop"
                                onChange={updateOptions('loop')}
                                checked={!!attributes['wpbs-slider']['loop']}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                            <ToggleControl
                                label="Dim"
                                onChange={updateOptions('dim')}
                                checked={!!attributes['wpbs-slider']['dim']}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                            <ToggleControl
                                label="From End"
                                onChange={updateOptions('from-end')}
                                checked={!!attributes['wpbs-slider']['from-end']}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                            <ToggleControl
                                label="Rewind"
                                onChange={updateOptions('rewind')}
                                checked={!!attributes['wpbs-slider']['rewind']}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                        </Grid>
                    </Grid>
                </PanelBody>
            </InspectorControls>
            <LayoutControls attributes={attributes} setAttributes={setAttributes}/>
            <Style attributes={attributes} setAttributes={setAttributes}
                   css={[layoutCss(attributes)]}
                   deps={['wpbs-layout', 'wpbs-slider', attributes?.uniqueId]}
                   props={cssProps}
            />

            <div ref={swiperRef} {...innerBlocksProps} />
        </>;


    },
    save: (props) => {

        const blockProps = useBlockProps.save({
            className: blockClasses(props.attributes),
            'data-wp-interactive': 'wpbs',
            'data-wp-init': 'callbacks.observeSlider',
            'data-wp-context': JSON.stringify({
                args: getArgs(props.attributes)
            })
        });

        const innerBlocksProps = useInnerBlocksProps.save(blockProps, {
            className: 'swiper-wrapper grow flex',
        });

        return (
            <div {...innerBlocksProps} />
        );
    }
})


