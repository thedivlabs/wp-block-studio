import '../scss/block.scss';

import {
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps
} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {LAYOUT_ATTRIBUTES, LayoutControls, layoutCss} from "Components/Layout"
import {BACKGROUND_ATTRIBUTES, BackgroundControls, BackgroundElement, backgroundCss} from "Components/Background"
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
import React, {useEffect, useState} from "react";
import {useInstanceId} from '@wordpress/compose';
import {swiperDefaultArgs} from "Includes/helper";

function blockClasses(attributes = {}) {

    const {'wpbs-slider': sliderArgs} = attributes;

    return [
        'wpbs-slider swiper overflow-hidden w-full relative !flex flex-col',
        attributes.uniqueId,
        !!sliderArgs.collapse ? 'wpbs-slider--collapse' : null,
    ].filter(x => x).join(' ');
}

function getArgs(attributes) {

    const breakpoint = attributes.breakpoint || 992;

    let args = {
        slidesPerView: attributes['wpbs-slides-mobile'] || attributes['wpbs-slides-large'] || 1,
        slidesPerGroup: attributes['wpbs-group-mobile'] || attributes['wpbs-group-large'] || 1,
        spaceBetween: attributes['wpbs-margin-mobile'] || attributes['wpbs-margin-large'] ? (attributes['wpbs-margin-mobile'] || attributes['wpbs-margin-large']).replace('px', '') : null,
        autoplay: attributes['wpbs-autoplay'] ? {
            delay: attributes['wpbs-autoplay'] * 1000,
            pauseOnMouseEnter: !!attributes['wpbs-hover-pause']
        } : false,
        speed: attributes['wpbs-transition'] ? attributes['wpbs-transition'] * 100 : null,
        pagination: attributes['wpbs-pagination'] ? {
            enabled: true,
            el: '.swiper-pagination',
            type: attributes['wpbs-pagination']
        } : false,
        effect: attributes['wpbs-effect'] || 'slide',
        freeMode: !!attributes['wpbs-effect'],
        centeredSlides: !!attributes['wpbs-centered'],
        loop: !!attributes['wpbs-loop'],
        rewind: !!attributes['wpbs-loop'] ? false : !!attributes['wpbs-rewind'],
        initialSlide: !!attributes['wpbs-from-end'] ? 99 : null,
        breakpoints: {}
    };

    let breakpointArgs = {
        slidesPerView: attributes['wpbs-slides-mobile'] && attributes['wpbs-slides-large'] ? attributes['wpbs-slides-large'] : null,
        slidesPerGroup: attributes['wpbs-group-mobile'] && attributes['wpbs-group-large'] ? attributes['wpbs-group-large'] : null,
        spaceBetween: attributes['wpbs-margin-mobile'] && attributes['wpbs-margin-large'] ? attributes['wpbs-margin-large'] : null,
    };

    if (!!attributes['wpbs-collapse']) {
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

    return args;
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...LAYOUT_ATTRIBUTES,
        ...BACKGROUND_ATTRIBUTES,
        ...STYLE_ATTRIBUTES,
        'wpbs-slider': {
            type: 'object',
            default: {
                slidesPerView: undefined,
                slidesPerGroup: undefined,
                spaceBetween: undefined,
                autoplay: undefined,
                speed: undefined,
                pagination: undefined,
                effect: undefined,
                freeMode: undefined,
                centeredSlides: undefined,
                loop: undefined,
                rewind: undefined,
                initialSlide: undefined,
                breakpoints: {}
            }
        }
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const [settings, setSettings] = useState(attributes['wpbs-slider']);
        const uniqueId = useInstanceId(registerBlockType, 'wpbs-slider');
        const breakpoints = WPBS?.settings?.breakpoints ?? {};

        useEffect(() => {

            setAttributes({
                uniqueId: uniqueId,
            });

        }, []);

        useEffect(() => {

            const args = getArgs(attributes);

            const mergedArgs = {
                ...swiperDefaultArgs,
                ...args
            };

            delete (mergedArgs.on);

            const blockId = 'block-' + clientId;
            const selector = '#' + blockId;
            const selectorAlt = '.' + uniqueId;

            const block = document.getElementById(blockId);

            if (block && 'swiper' in block) {

                block.swiper.destroy();
            }

            if ('Swiper' in window && selector) {

                const swiper = new Swiper(selectorAlt, mergedArgs);
            }


        }, [attributes['wpbs-slider']]);


        const blockProps = useBlockProps({
            className: blockClasses(attributes)
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/slider-wrapper', {}],
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
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-slides-mobile']: newValue});
                                    setSlidesMobile(newValue);
                                    updateSlider({});
                                }}
                                value={slidesMobile}
                            />
                            <NumberControl
                                label={'Slides Large'}
                                __next40pxDefaultSize
                                isShiftStepEnabled={true}
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-slides-large']: newValue});
                                    setSlidesLarge(newValue);
                                    updateSlider();
                                }}
                                value={slidesLarge}
                            />
                            <NumberControl
                                label={'Group Mobile'}
                                __next40pxDefaultSize
                                isShiftStepEnabled={true}
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-group-mobile']: newValue});
                                    setGroupMobile(newValue);
                                    updateSlider();
                                }}
                                value={groupMobile}
                            />
                            <NumberControl
                                label={'Group Large'}
                                __next40pxDefaultSize
                                isShiftStepEnabled={true}
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-group-large']: newValue});
                                    setGroupLarge(newValue);
                                    updateSlider();
                                }}
                                value={groupLarge}
                            />
                            <NumberControl
                                label={'Autoplay'}
                                __next40pxDefaultSize
                                isShiftStepEnabled={true}
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-autoplay']: newValue});
                                    setAutoplay(newValue);
                                    updateSlider();
                                }}
                                step={1}
                                value={autoplay}
                            />
                            <NumberControl
                                label={'Transition'}
                                __next40pxDefaultSize
                                isShiftStepEnabled={true}
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-transition']: newValue});
                                    setTransition(newValue);

                                    updateSlider();
                                }}
                                step={1}
                                value={transition}
                            />
                            <UnitControl
                                label={'Margin Mobile'}
                                value={marginMobile}
                                isResetValueOnUnitChange={true}
                                units={[
                                    {value: 'px', label: 'px', default: 0},
                                ]}
                                __next40pxDefaultSize
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-margin-mobile']: newValue});
                                    setMarginMobile(newValue);
                                    updateSlider();
                                }}
                            />
                            <UnitControl
                                label={'Margin Large'}
                                value={marginLarge}
                                isResetValueOnUnitChange={true}
                                units={[
                                    {value: 'px', label: 'px', default: 0},
                                ]}
                                __next40pxDefaultSize
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-margin-large']: newValue});
                                    setMarginLarge(newValue);
                                    updateSlider();
                                }}
                            />


                            <SelectControl
                                label={'Pagination'}
                                value={pagination}
                                options={[
                                    {label: 'Default', value: 'none'},
                                    {label: 'Progress Bar', value: 'progressbar'},
                                    {label: 'Bullets', value: 'bullets'},
                                ]}
                                onChange={(newValue) => {
                                    setPagination(newValue);
                                    setAttributes({['wpbs-pagination']: newValue});
                                    updateSlider();
                                }}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                            <SelectControl
                                label={'Effect'}
                                value={effect}
                                options={[
                                    {label: 'Default', value: ''},
                                    {label: 'Fade', value: 'fade'},
                                    {label: 'Flip', value: 'flip'},
                                ]}
                                onChange={(newValue) => {
                                    setEffect(newValue);
                                    setAttributes({['wpbs-effect']: newValue});
                                    updateSlider();
                                }}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                        </Grid>

                        <Grid columns={2} columnGap={15} rowGap={20}
                              style={{padding: '1rem 0'}}>
                            <ToggleControl
                                label="Hover Pause"
                                checked={!!hoverPause}
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-hover-pause']: newValue});
                                    setHoverPause(newValue);
                                    updateSlider();
                                }}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                            <ToggleControl
                                label="Free Mode"
                                checked={!!freeMode}
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-free-mode']: newValue});
                                    setFreeMode(newValue);
                                    updateSlider();
                                }}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                            <ToggleControl
                                label="Centered"
                                checked={!!centered}
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-centered']: newValue});
                                    setCentered(newValue);
                                    updateSlider();
                                }}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                            <ToggleControl
                                label="Collapse"
                                checked={!!collapse}
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-collapse']: !!newValue});
                                    setCollapse(!!newValue);
                                    updateSlider();
                                }}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                            <ToggleControl
                                label="Loop"
                                checked={!!loop}
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-loop']: newValue});
                                    setLoop(newValue);
                                    updateSlider();
                                }}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                            <ToggleControl
                                label="Dim"
                                checked={!!dim}
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-dim']: newValue});
                                    setDim(newValue);
                                    updateSlider();
                                }}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                            <ToggleControl
                                label="From End"
                                checked={!!fromEnd}
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-from-end']: newValue});
                                    setFromEnd(newValue);
                                    updateSlider();
                                }}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                            <ToggleControl
                                label="Rewind"
                                checked={!!rewind}
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-rewind']: newValue});
                                    setRewind(newValue);
                                    updateSlider();
                                }}
                                className={'flex items-center'}
                                __nextHasNoMarginBottom
                            />
                        </Grid>

                    </Grid>


                </PanelBody>
            </InspectorControls>
            <LayoutSettings attributes={attributes} setAttributes={setAttributes} />
            <Style attributes={attributes} setAttributes={setAttributes} uniqueId={uniqueId} selector={'wpbs-slider'} />

            <div {...innerBlocksProps}></div>
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

        const innerBlocksProps = useInnerBlocksProps.save(blockProps);

        return (
            <div {...innerBlocksProps}></div>
        );
    }
})


