import '../scss/block.scss';

import {BlockEdit, InspectorControls, useBlockProps, useInnerBlocksProps, useSettings} from "@wordpress/block-editor"
import {registerBlockType} from "@wordpress/blocks"
import metadata from "../block.json"
import {Layout, LayoutAttributes, LayoutClasses} from "Components/Layout"
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
import {select, useSelect} from "@wordpress/data";

function blockClasses(attributes = {}) {
    return [
        'wpbs-slider swiper overflow-hidden w-full relative !flex flex-col',
        attributes.uniqueId,
        !!attributes['wpbs-collapse'] ? 'wpbs-slider--collapse' : null,
        LayoutClasses(attributes)
    ].filter(x => x).join(' ');
}

const blockAttributes = {
    'wpbs-prop-slides': {
        type: 'string'
    },
    'wpbs-prop-slides-mobile': {
        type: 'string'
    },
    'wpbs-slides-mobile': {
        type: 'string'
    },
    'wpbs-slides-large': {
        type: 'string'
    },
    'wpbs-group-mobile': {
        type: 'string'
    },
    'wpbs-group-large': {
        type: 'string'
    },
    'wpbs-margin-mobile': {
        type: 'string'
    },
    'wpbs-margin-large': {
        type: 'string'
    },
    'wpbs-autoplay': {
        type: 'string'
    },
    'wpbs-transition': {
        type: 'string'
    },
    'wpbs-pagination': {
        type: 'string'
    },
    'wpbs-effect': {
        type: 'string'
    },
    'wpbs-hover-pause': {
        type: 'boolean'
    },
    'wpbs-fade-in': {
        type: 'boolean'
    },
    'wpbs-free-mode': {
        type: 'boolean'
    },
    'wpbs-centered': {
        type: 'boolean'
    },
    'wpbs-collapse': {
        type: 'boolean'
    },
    'wpbs-loop': {
        type: 'boolean'
    },
    'wpbs-dim': {
        type: 'boolean'
    },
    'wpbs-from-end': {
        type: 'boolean'
    },
    'wpbs-rewind': {
        type: 'boolean'
    },
    'swiperArgs': {
        type: 'object'
    },
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

    if (args.effect === 'fade') {
        args.fadeEffect = {
            crossFade: true
        }
        args.slidesPerView = 1;
        args.slidesPerGroup = 1;
        args.spaceBetween = 0;
        args.freeMode = false;
        args.loop = false;
    }

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
        ...LayoutAttributes,
        ...blockAttributes
    },
    edit: ({attributes, setAttributes, clientId}) => {

        const [slidesMobile, setSlidesMobile] = useState(attributes['wpbs-slides-mobile']);
        const [slidesLarge, setSlidesLarge] = useState(attributes['wpbs-slides-large']);

        const [groupMobile, setGroupMobile] = useState(attributes['wpbs-group-mobile']);
        const [groupLarge, setGroupLarge] = useState(attributes['wpbs-group-large']);

        const [marginMobile, setMarginMobile] = useState(attributes['wpbs-margin-mobile'] || '');
        const [marginLarge, setMarginLarge] = useState(attributes['wpbs-margin-large']) || '';

        const [autoplay, setAutoplay] = useState(attributes['wpbs-autoplay']);
        const [transition, setTransition] = useState(attributes['wpbs-transition']);
        const [pagination, setPagination] = useState(attributes['wpbs-pagination']);
        const [effect, setEffect] = useState(attributes['wpbs-effect']);

        const [hoverPause, setHoverPause] = useState(attributes['wpbs-hover-pause']);
        const [fadeIn, setFadeIn] = useState(attributes['wpbs-fade-in']);
        const [freeMode, setFreeMode] = useState(attributes['wpbs-free-mode']);
        const [centered, setCentered] = useState(attributes['wpbs-centered']);
        const [collapse, setCollapse] = useState(attributes['wpbs-collapse'] || false);
        const [loop, setLoop] = useState(attributes['wpbs-loop']);
        const [dim, setDim] = useState(attributes['wpbs-dim']);
        const [fromEnd, setFromEnd] = useState(attributes['wpbs-from-end']);
        const [rewind, setRewind] = useState(attributes['wpbs-rewind']);
        const [swiperArgs, setSwiperArgs] = useState(attributes.swiperArgs || {});

        const uniqueId = useInstanceId(registerBlockType, 'wpbs-slider');

        const [{breakpoints}] = useSettings(['custom']);

        const breakpoint = breakpoints[attributes['wpbs-layout-breakpoint'] || 'md'].replace('px', '');

        function updateSlider() {

            const args = getArgs(attributes);

            setAttributes({['wpbs-prop-slides']: attributes['wpbs-slidesLarge'] || attributes['wpbs-slidesMobile'] || '1'});
            setAttributes({['wpbs-prop-slides-mobile']: attributes['wpbs-slidesMobile'] || attributes['wpbs-slidesLarge'] || '1'});
            setAttributes({breakpoint: breakpoint});
            setAttributes({swiperArgs: args});
            setSwiperArgs(args);

        }

        useEffect(() => {

            setAttributes({
                uniqueId: uniqueId,
                ['wpbs-prop-slides']: attributes['wpbs-slides-large'] || attributes['wpbs-slides-mobile'] || '1',
                ['wpbs-prop-slides-mobile']: attributes['wpbs-slides-mobile'] || attributes['wpbs-slides-large'] || '1'
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

            const block = document.getElementById(blockId);

            if ('swiper' in block) {

                block.swiper.destroy();
            }

            const swiper = new Swiper(selector, mergedArgs);


        }, [swiperArgs]);


        const blockProps = useBlockProps({
            className: [
                blockClasses(attributes)
            ].join(' ')
        });

        const innerBlocksProps = useInnerBlocksProps(blockProps, {
            template: [
                ['wpbs/slider-wrapper', {}],
            ]
        });


        return <>
            <BlockEdit key="edit" {...blockProps} />
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
                                label="Fade In"
                                checked={!!fadeIn}
                                onChange={(newValue) => {
                                    setAttributes({['wpbs-fade-in']: newValue});
                                    setFadeIn(newValue);
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

            <Layout blockProps={blockProps} attributes={attributes} setAttributes={setAttributes}
                    clientId={clientId}></Layout>

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


