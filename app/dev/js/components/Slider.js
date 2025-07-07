import {
    InspectorControls,
} from "@wordpress/block-editor"
import {SWIPER_ARGS_DEFAULT, SWIPER_ARGS_EDITOR} from "Includes/config";
import merge from 'lodash.merge';
import {
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    __experimentalUnitControl as UnitControl,
    PanelBody,
    SelectControl,
    ToggleControl
} from "@wordpress/components";
import React, {useCallback, useEffect, useMemo, forwardRef} from "react";


export const SLIDER_ATTRIBUTES = {
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
            'fade-in': undefined,
            'drag': true,
            'swiperArgs': undefined,
        }
    },
    'wpbs-swiper-args': {
        type: 'object',
        default: undefined,
    }
};

export const SliderComponent = forwardRef(({attributes, blockProps, innerBlocksProps}, ref) => {

    useEffect(() => {

        const element = ref.current;

        if (!element) {
            return;
        }

        if (element?.swiper) {

            const newParams = {
                ...SWIPER_ARGS_DEFAULT,
                ...attributes?.['wpbs-swiper-args'] ?? {},
                ...SWIPER_ARGS_EDITOR
            };


            if (element?.swiper?.currentBreakpoint) {
                element.swiper.currentBreakpoint = null;
            }

            element.swiper.params = merge({}, element.swiper.params, newParams);

            element.swiper.update();

        } else {

            const swiperConfig = {
                ...SWIPER_ARGS_DEFAULT,
                ...attributes?.['wpbs-swiper-args'] ?? {},
                ...SWIPER_ARGS_EDITOR
            };

            const swiper = new Swiper(element, swiperConfig);

        }
    }, [attributes?.['wpbs-swiper-args'], element]);

    return <div {...blockProps} ref={ref}>
        <div className={"swiper-wrapper"}>
            {innerBlocksProps.children}
        </div>
    </div>;
})

export function getSliderArgs(options, attributes) {


    const breakpoint = attributes?.breakpoint ?? 992;

    let args = {
        enabled: true,
        slidesPerView: parseInt(options['slides-mobile'] || options['slides-large'] || 1),
        slidesPerGroup: parseInt(options['group-mobile'] || options['group-large'] || 1),
        spaceBetween: parseInt(options?.['margin-mobile'] ?? options?.['margin-large'] ?? 0),
        autoplay: (options?.['autoplay'] ?? 0) > 0 ? {
            delay: options?.['autoplay'] * 1000,
            pauseOnMouseEnter: !!options['hover-pause']
        } : false,
        speed: parseInt(options['transition'] ? options['transition'] * 100 : null) || null,
        pagination: (options?.['pagination'] !== 'none') ? {
            enabled: true,
            type: options['pagination']
        } : false,
        effect: options['effect'] || 'slide',
        freeMode: !!options['effect'],
        centeredSlides: !!options['centered'],
        loop: !!options['loop'],
        rewind: !!options['loop'] ? false : !!options['rewind'],
        initialSlide: !!options['from-end'] ? 99 : 1,
        breakpoints: {},
        simulateTouch: !!options?.drag
    };

    let breakpointArgs = {
        slidesPerView: parseInt(options['slides-mobile'] && options['slides-large'] ? options['slides-large'] : 1),
        slidesPerGroup: parseInt(options['group-mobile'] && options['group-large'] ? options['group-large'] : 1),
        spaceBetween: parseInt(options?.['margin-large'] ?? options?.['margin-mobile'] ?? 0),
    };

    if (!!options?.['collapse']) {
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

    args = Object.fromEntries(Object.entries(args).filter(([_, value]) => Boolean(value)));

    return merge({}, SWIPER_ARGS_DEFAULT, args);
}

export function sliderProps(attributes) {

    const breakpoint = WPBS?.settings?.breakpoints?.[attributes?.['wpbs-breakpoint']?.large ?? 'normal'];

    return cleanArgs({
        '--slides': attributes['wpbs-slider']?.['slides-mobile'] ?? attributes['wpbs-slider']?.['slides-large'] ?? 1,
        breakpoints: {
            [breakpoint]: {
                '--slides': attributes['wpbs-slider']?.['slides-large'] ?? null,
            }
        }
    });


}

export const SliderControls = ({attributes, setAttributes}) => {

    const updateOptions = useCallback((newValue) => {

        const result = {
            ...(attributes?.['wpbs-slider'] ?? {}),
            ...newValue
        };

        const swiperArgs = getSliderArgs(result, attributes);

        setAttributes({
            'wpbs-slider': result,
            'wpbs-swiper-args': swiperArgs,
        });

    }, [setAttributes, attributes?.['wpbs-slider'], attributes?.['wpbs-swiper-args']]);


    return <Grid columns={1} columnGap={15} rowGap={20}>
        <Grid columns={2} columnGap={15} rowGap={20}>
            <NumberControl
                label={'Slides Mobile'}
                min={1}
                __next40pxDefaultSize
                isShiftStepEnabled={true}
                onChange={(newValue) => updateOptions({'slides-mobile': newValue})}
                value={attributes['wpbs-slider']?.['slides-mobile']}
            />
            <NumberControl
                label={'Slides Large'}
                min={1}
                __next40pxDefaultSize
                isShiftStepEnabled={true}
                onChange={(newValue) => updateOptions({'slides-large': newValue})}
                value={attributes['wpbs-slider']?.['slides-large']}
            />
            <NumberControl
                label={'Group Mobile'}
                __next40pxDefaultSize
                isShiftStepEnabled={true}
                onChange={(newValue) => updateOptions({'group-mobile': newValue})}
                value={attributes['wpbs-slider']?.['group-mobile']}
            />
            <NumberControl
                label={'Group Large'}
                __next40pxDefaultSize
                isShiftStepEnabled={true}
                onChange={(newValue) => updateOptions({'group-large': newValue})}
                value={attributes['wpbs-slider']?.['group-large']}
            />
            <NumberControl
                label={'Autoplay'}
                __next40pxDefaultSize
                isShiftStepEnabled={true}
                onChange={(newValue) => updateOptions({'autoplay': newValue})}
                value={attributes?.['wpbs-slider']?.['autoplay']}
                step={1}
            />
            <NumberControl
                label={'Transition'}
                __next40pxDefaultSize
                isShiftStepEnabled={true}
                onChange={(newValue) => updateOptions({'transition': newValue})}
                value={attributes['wpbs-slider']?.['transition']}
                step={1}
            />
            <UnitControl
                label={'Margin Mobile'}
                isResetValueOnUnitChange={true}
                units={[
                    {value: 'px', label: 'px', default: 0},
                ]}
                __next40pxDefaultSize
                onChange={(newValue) => updateOptions({'margin-mobile': newValue})}
                value={attributes['wpbs-slider']?.['margin-mobile']}
            />
            <UnitControl
                label={'Margin Large'}
                isResetValueOnUnitChange={true}
                units={[
                    {value: 'px', label: 'px', default: 0},
                ]}
                __next40pxDefaultSize
                onChange={(newValue) => updateOptions({'margin-large': newValue})}
                value={attributes['wpbs-slider']?.['margin-large']}
            />


            <SelectControl
                label={'Pagination'}
                options={[
                    {label: 'Default', value: 'none'},
                    {label: 'Progress Bar', value: 'progressbar'},
                    {label: 'Bullets', value: 'bullets'},
                ]}
                onChange={(newValue) => updateOptions({'pagination': newValue})}
                value={attributes['wpbs-slider']?.['pagination']}
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
                onChange={(newValue) => updateOptions({'effect': newValue})}
                value={attributes['wpbs-slider']?.['effect']}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />
        </Grid>

        <Grid columns={2} columnGap={15} rowGap={20}
              style={{padding: '1rem 0'}}>
            <ToggleControl
                label="Hover Pause"
                onChange={(newValue) => updateOptions({'hover-pause': newValue})}
                checked={!!attributes?.['wpbs-slider']?.['hover-pause']}
                className={'flex items-center'}
                __nextHasNoMarginBottom
            />
            <ToggleControl
                label="Free Mode"
                onChange={(newValue) => updateOptions({'free-mode': newValue})}
                checked={!!attributes?.['wpbs-slider']?.['free-mode']}
                className={'flex items-center'}
                __nextHasNoMarginBottom
            />
            <ToggleControl
                label="Centered"
                onChange={(newValue) => updateOptions({'centered': newValue})}
                checked={!!attributes?.['wpbs-slider']?.['centered']}
                className={'flex items-center'}
                __nextHasNoMarginBottom
            />
            <ToggleControl
                label="Collapse"
                onChange={(newValue) => updateOptions({'collapse': newValue})}
                checked={!!attributes?.['wpbs-slider']?.['collapse']}
                className={'flex items-center'}
                __nextHasNoMarginBottom
            />
            <ToggleControl
                label="Loop"
                onChange={(newValue) => updateOptions({'loop': newValue})}
                checked={!!attributes?.['wpbs-slider']?.['loop']}
                className={'flex items-center'}
                __nextHasNoMarginBottom
            />
            <ToggleControl
                label="Dim"
                onChange={(newValue) => updateOptions({'dim': newValue})}
                checked={!!attributes?.['wpbs-slider']?.['dim']}
                className={'flex items-center'}
                __nextHasNoMarginBottom
            />
            <ToggleControl
                label="From End"
                onChange={(newValue) => updateOptions({'from-end': newValue})}
                checked={!!attributes?.['wpbs-slider']?.['from-end']}
                className={'flex items-center'}
                __nextHasNoMarginBottom
            />
            <ToggleControl
                label="Rewind"
                onChange={(newValue) => updateOptions({'rewind': newValue})}
                checked={!!attributes?.['wpbs-slider']?.['rewind']}
                className={'flex items-center'}
                __nextHasNoMarginBottom
            />
            <ToggleControl
                label="Fade In"
                onChange={(newValue) => updateOptions({'fade-in': newValue})}
                checked={!!attributes?.['wpbs-slider']?.['fade-in']}
                className={'flex items-center'}
                __nextHasNoMarginBottom
            />
            <ToggleControl
                label="Drag"
                onChange={(newValue) => updateOptions({'drag': newValue})}
                checked={!!attributes?.['wpbs-slider']?.['drag']}
                className={'flex items-center'}
                __nextHasNoMarginBottom
            />
        </Grid>
    </Grid>;
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








