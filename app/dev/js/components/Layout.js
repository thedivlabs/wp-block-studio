import React, {useCallback, useMemo, useState} from "react";

import {
    InspectorControls, MediaUpload, MediaUploadCheck,
    PanelColorSettings, useSetting,
} from "@wordpress/block-editor";
import {
    BorderBoxControl,
    __experimentalBoxControl as BoxControl,
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
    __experimentalUnitControl as UnitControl, BaseControl, FormTokenField, PanelBody,
    RangeControl,
    SelectControl, ToggleControl
} from "@wordpress/components";

import {getCSSFromStyle} from 'Components/Style';
import PreviewThumbnail from "Components/PreviewThumbnail.js";
import {
    DISPLAY_OPTIONS,
    DIRECTION_OPTIONS,
    CONTAINER_OPTIONS,
    ALIGN_OPTIONS,
    JUSTIFY_OPTIONS,
    WIDTH_OPTIONS,
    HEIGHT_OPTIONS,
    WRAP_OPTIONS,
    POSITION_OPTIONS,
    OVERFLOW_OPTIONS,
    SHAPE_OPTIONS,
    ORIGIN_OPTIONS,
    IMAGE_SIZE_OPTIONS,
    DIMENSION_UNITS,
    BORDER_UNITS,
} from "Includes/config";
import {ColorSelector} from "./ColorSelector";
import {ShadowSelector} from "Components/ShadowSelector";

export const LAYOUT_ATTRIBUTES = {
    'wpbs-layout': {
        type: 'object',
        default: {}
    },
    'wpbs-breakpoint': {
        type: 'object',
        default: {
            mobile: 'small',
            large: 'normal'
        }
    },
    'wpbs-props': {
        type: 'object',
    }
};

const LAYOUT_PROPS = {
    special: [
        'text-color-mobile',
        'background-color-mobile',
        'border-radius-mobile',
        'border-mobile',
        'offset-height',
        'offset-height-mobile',
        'gap-mobile',
        'align-header',
        'outline',
        'outline-mobile',
        'duration',
        'reveal',
        'reveal-easing',
        'reveal-duration',
        'reveal-offset',
        'reveal-distance',
        'reveal-repeat',
        'reveal-mirror',
        'reveal-mobile',
        'offset-header',
        'align-header',
        'transition',
        'breakpoint',
        'mask-image',
        'mask-image-mobile',
        'mask-repeat',
        'mask-size',
        'mask-origin',
        'margin-mobile',
        'basis',
        'basis-mobile',
        'height',
        'height-mobile',
        'height-custom',
        'height-custom-mobile',
        'min-height',
        'min-height-mobile',
        'min-height-custom',
        'min-height-custom-mobile',
        'max-height',
        'max-height-mobile',
        'max-height-custom',
        'max-height-custom-mobile',
        'width',
        'width-mobile',
        'width-custom',
        'width-custom-mobile',
        'translate',
        'translate-mobile',
        'offset-header',
        'offset-header-mobile',
        'text-color-hover',
        'text-color-mobile',
        'text-decoration-color',
        'position',
        'position-mobile',
        'container',
        'container-mobile',
        'padding-mobile',
        'shadow-hover',
    ],
    layout: [
        'offset-height',
        'reveal',
        'reveal-easing',
        'reveal-duration',
        'reveal-offset',
        'reveal-distance',
        'reveal-repeat',
        'reveal-mirror',
        'reveal-mobile',
        'offset-header',
        'align-header',
        'display',
        'mask-image',
        'mask-origin',
        'mask-size',
        'flex-direction',
        'container',
        'align-items',
        'justify-content',
        'opacity',
        'basis',
        'width',
        'transition',
        'duration',
        'width-custom',
        'max-width',
        'height',
        'height-custom',
        'min-height',
        'min-height-custom',
        'max-height',
        'max-height-custom',
        'flex-wrap',
        'flex-grow',
        'flex-shrink',
        'position',
        'z-index',
        'top',
        'right',
        'bottom',
        'left',
        'overflow',
        'aspect-ratio',
        'order',
        'translate',
        'outline',
        'mark-empty',
        'text-decoration-color',
    ],

    mobile: [
        'offset-height-mobile',
        'mask-image-mobile',
        'mask-origin-mobile',
        'mask-size-mobile',
        'offset-header-mobile',
        'display-mobile',
        'breakpoint',
        'align-items-mobile',
        'justify-content-mobile',
        'opacity-mobile',
        'basis-mobile',
        'width-mobile',
        'width-custom-mobile',
        'max-width-mobile',
        'height-mobile',
        'height-custom-mobile',
        'min-height-mobile',
        'min-height-custom-mobile',
        'max-height-mobile',
        'max-height-custom-mobile',
        'flex-grow-mobile',
        'flex-shrink-mobile',
        'flex-direction-mobile',
        'aspect-ratio-mobile',
        'position-mobile',
        'z-index-mobile',
        'top-mobile',
        'right-mobile',
        'bottom-mobile',
        'left-mobile',
        'order-mobile',
        'translate-mobile',
        'padding-mobile',
        'margin-mobile',
        'gap-mobile',
        'border-radius-mobile',
        'font-size-mobile',
        'line-height-mobile',
        'text-align-mobile',
        'flex-wrap-mobile',
        'text-color-mobile',
        'background-color-mobile'
    ],

    hover: [
        'shadow-hover',
        'text-color-hover',
        'background-color-hover',
        'border-color-hover',
        'text-decoration-color-hover',
    ],

};

const MemoMediaControl = React.memo(({label, allowedTypes, value, callback, clear}) => (
    <BaseControl
        label={label}
        __nextHasNoMarginBottom={true}
    >
        <MediaUploadCheck>
            <MediaUpload
                title={label}
                onSelect={callback}
                allowedTypes={allowedTypes || ['image']}
                value={value}
                render={({open}) => {
                    return <PreviewThumbnail
                        image={value}
                        callback={clear}
                        style={{
                            objectFit: 'contain'
                        }}
                        onClick={open}
                    />;
                }}
            />
        </MediaUploadCheck>
    </BaseControl>
));

const MemoSelectControl = React.memo(({label, options, value, callback}) => (
    <SelectControl
        label={label}
        options={options}
        value={value}
        onChange={callback}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />
));

const MemoBorderControl = React.memo(({label, value, callback, colors}) => (

    <BorderBoxControl
        label={label}
        value={value}
        enableAlpha={true}
        enableStyle={true}
        disableCustomColors={false}
        colors={colors}
        withSlider={true}
        isStyleSettable={true}
        onChange={callback}
        __experimentalIsRenderedInSidebar={true}
        __next40pxDefaultSize
        sides={['top', 'right', 'bottom', 'left']}
    />
));

const MemoBoxControl = React.memo(({label, inputProps, value, callback, sides}) => (
    <BoxControl
        label={label}
        values={value}
        sides={sides}
        onChange={callback}
        inputProps={inputProps}
        __nextHasNoMarginBottom={true}
    />
));

const MemoNumberControl = React.memo(({label, value, callback, min}) => (
    <NumberControl
        label={label}
        value={value}
        min={min || 0}
        isDragEnabled={false}
        onChange={callback}
        __next40pxDefaultSize
    />
));

const MemoUnitControl = React.memo(({label, value, units, callback}) => (
    <UnitControl
        label={label}
        value={value}
        units={units || DIMENSION_UNITS}
        isResetValueOnUnitChange={true}
        onChange={callback}
        __next40pxDefaultSize
    />
));

const MemoRangeControl = React.memo(({label, callback, value, step, min, max}) => (
    <RangeControl
        label={label}
        step={step}
        withInputField={true}
        allowReset={true}
        isShiftStepEnabled
        initialPosition={0}
        value={value}
        onChange={callback}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
        min={min}
        max={max}
    />
));

const heightVal = (val) => {

    let height = 'calc(' + val + ' + var(--offset-height, 0px))';

    if (val === 'screen') {
        height = 'calc((100svh - var(--wpbs-header-height, 0px)) + var(--offset-height, 0px))'
    }

    if (val === 'full-screen') {
        height = 'calc(100svh + var(--offset-height, 0px))'
    }

    if (['auto', 'full', 'inherit'].includes(val)) {
        height = val;
    }

    return height;

}

function parseSpecial(prop, attributes) {

    const {'wpbs-layout': settings = {}} = attributes;

    if (!settings?.[prop]) {
        return {};
    }

    const value = settings[prop];

    const parsedProp = prop.replace(/-hover|-mobile/g, '');

    let result = {};

    switch (parsedProp) {
        case 'shadow':
            if (!value) {
                break;
            }

            result = {'filter': 'drop-shadow(' + value?.shadow + ')'};
            break;
        case 'border-radius':
            result = {'border-radius': Object.values(value).join(' ')};
            break;
        case 'mask-image':
            const imageUrl = value?.sizes?.full?.url || '#';
            result = {
                'mask-image': 'url(' + imageUrl + ')',
                'mask-repeat': 'no-repeat',
                'mask-size': (() => {
                    switch (settings?.['mask-size']) {
                        case 'cover':
                            return 'cover';
                        case 'horizontal':
                            return '100% auto';
                        case 'vertical':
                            return 'auto 100%';
                        default:
                            return 'contain';
                    }
                })(),
                'mask-position': settings?.['mask-origin'] || 'center center'
            };

            break;
        case 'margin':
            result = Object.fromEntries(Object.entries({
                'margin-top': settings[prop]?.top,
                'margin-right': settings[prop]?.right,
                'margin-bottom': settings[prop]?.bottom,
                'margin-left': settings[prop]?.left,
            }).filter(([k, v]) => !!v))
            break;
        case 'border':
            result = !!settings[prop]?.top ? Object.fromEntries(Object.entries({
                'border-top': Object.values({style: 'solid', ...(settings[prop]?.top ?? {})}).join(' '),
                'border-right': Object.values({style: 'solid', ...(settings[prop]?.right ?? {})}).join(' '),
                'border-bottom': Object.values({style: 'solid', ...(settings[prop]?.bottom ?? {})}).join(' '),
                'border-left': Object.values({style: 'solid', ...(settings[prop]?.left ?? {})}).join(' '),
            }).filter(([k, v]) => !!v)) : {border: Object.values({style: 'solid', ...(settings[prop] ?? {})}).join(' ')};
            break;
        case 'outline':
            result = !!settings[prop]?.top ? Object.fromEntries(Object.entries({
                'outline-top': Object.values({style: 'solid', ...(settings[prop]?.top ?? {})}).join(' '),
                'outline-right': Object.values({style: 'solid', ...(settings[prop]?.right ?? {})}).join(' '),
                'outline-bottom': Object.values({style: 'solid', ...(settings[prop]?.bottom ?? {})}).join(' '),
                'outline-left': Object.values({style: 'solid', ...(settings[prop]?.left ?? {})}).join(' '),
            }).filter(([k, v]) => !!v)) : {outline: Object.values({style: 'solid', ...(settings[prop] ?? {})}).join(' ')};
            break;
        case 'padding':
            result = Object.fromEntries(Object.entries({
                'padding-top': settings[prop]?.top,
                'padding-right': settings[prop]?.right,
                'padding-bottom': settings[prop]?.bottom,
                'padding-left': settings[prop]?.left,
            }).filter(([k, v]) => !!v))
            break;
        case 'basis':
            result = {'flex-basis': value + '%'}
            break;
        case 'transition':

            const transitions = [...value];

            if (value.includes('color') && !value.includes('text-decoration-color')) {
                transitions.push('text-decoration-color');
            }

            result = {
                'transition-property': transitions.join(', '),
            }

            break;
        case 'duration':

            result = {
                'transition-duration': settings?.['duration']
            }

            break;
        case 'text-color':
            result = {'color': value}
            break;

        case 'text-decoration-color':
            result = {
                'text-decoration-color': value + ' !important',
                'text-underline-offset': '.3em'
            }
            break;

        case 'height-custom':
            result = {
                'height': heightVal(settings?.[prop] ?? null),
                '--height': heightVal(settings?.[prop] ?? null),
            }
            break;
        case 'height':
            result = {
                'height': heightVal(settings?.[prop] ?? null),
                '--height': heightVal(settings?.[prop] ?? null),
            }
            break;

        case 'min-height-custom':
            result = {'min-height': heightVal(settings?.[prop] ?? null)}
            break;

        case 'min-height':
            result = {'min-height': heightVal(settings?.[prop] ?? null)}
            break;

        case 'max-height-custom':
            result = {'max-height': heightVal(settings?.[prop] ?? null)}
            break;

        case 'max-height':
            result = {'max-height': heightVal(settings?.[prop] ?? null)}
            break;

        case 'width-custom':
            result = {'width': settings?.[prop] ?? null}
            break;

        case 'width':
            result = {'width': settings?.[prop] ?? null}

            break;
        case 'translate':
            result = {
                'transform': 'translate(' + [
                    getCSSFromStyle(settings?.['translate']?.top || '0px'),
                    getCSSFromStyle(settings?.['translate']?.left || '0px')
                ].join(',') + ')'
            }
            break;
        case 'offset-header':
            result = {'padding-top': 'calc(' + getCSSFromStyle(attributes?.style?.spacing?.padding?.top || '0px') + ' + var(--wpbs-header-height, 0px)) !important'}
            break;
        case 'align-header':
            result = {'top': 'var(--wpbs-header-height, auto)'}
            break;
        case 'position':
            switch (value) {
                case 'fixed-push':
                case 'fixed':
                    result = {'position': 'fixed'}
                    break;
                default:
                    result = {'position': value}
            }
            break;
    }

    Object.entries(result).forEach(([k, val]) => {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            result[k] = Object.entries(val)
                .filter(([_, v]) => v !== undefined && v !== null)
                .map(([k, v]) => `${k.replace('-mobile', '').replace('-hover', '')}: ${v};`)
                .join(' ');
        }
    });

    return result;


}

export function layoutCss(attributes, selector) {

    if (!Object.keys(attributes?.['wpbs-layout'] ?? {}).length || !attributes.uniqueId) {
        return '';
    }

    const {'wpbs-layout': settings = {}} = attributes;

    const bp_key = settings?.breakpoint ? settings?.breakpoint : 'normal';

    const breakpoint = '%__BREAKPOINT__' + bp_key + '__%';
    const container = settings?.container ? '%__CONTAINER__' + (settings?.container) + '__%' : false;

    const height = heightVal(!!settings?.['height-custom'] ? settings?.['height-custom'] : settings?.['height'] ?? '100%');
    const offsetHeight = !!settings?.['offset-height']?.length ? settings?.['offset-height'] : '0px';
    const heightMobile = heightVal(!!settings?.['height-custom-mobile']?.length ? settings?.['height-custom-mobile'] : settings?.['height-mobile'] ?? '100%');
    const offsetHeightMobile = !!settings?.['offset-height-mobile']?.length ? settings?.['offset-height-mobile'] : '0px';

    let css = '';
    let desktop = {};
    let mobile = {};
    let hover = {};


    // Not mobile
    Object.entries(settings).filter(([k, value]) =>
        !k.toLowerCase().includes('mobile') &&
        !k.toLowerCase().includes('hover')
    ).forEach(([prop, value]) => {

        if (!value) {
            return;
        }

        if (LAYOUT_PROPS.special.includes(prop)) {

            desktop = {
                ...desktop,
                ...parseSpecial(prop, attributes)
            };

        } else {
            desktop[prop] = value;
        }

    });

    // Mobile
    Object.entries(settings).filter(([k, value]) =>
        k.toLowerCase().includes('mobile') &&
        !k.toLowerCase().includes('hover')
    ).forEach(([prop, value]) => {

        if (!value) {
            return;
        }

        if (LAYOUT_PROPS.special.includes(prop)) {

            mobile = {
                ...mobile,
                ...parseSpecial(prop, attributes)
            };

        } else {
            prop = prop.replace(/-mobile/g, '');
            mobile[prop] = value;
        }

    });

    // Hover
    Object.entries(settings).filter(([k, value]) =>
        String(k).toLowerCase().includes('hover')
    ).forEach(([prop, value]) => {


        if (!value) {
            return;
        }

        if (LAYOUT_PROPS.special.includes(prop)) {

            hover = {
                ...hover,
                ...parseSpecial(prop, attributes)
            };

        } else {
            prop = prop.replace(/-hover/g, '');
            hover[prop] = value;
        }

    });

    if (Object.keys(desktop).length || container) {
        css += selector + '{';
        Object.entries(desktop).forEach(([prop, value]) => {

            css += [prop, value].join(':') + ';';
        })

        if (container) {
            css += '--container-width: ' + container + ';';
        }

        css += '--offset-height: ' + offsetHeight + ';';
        css += '}';
    }

    if (!!settings?.reveal) {

        const revealCss = selector + '[data-aos]:not(.aos-animate.aos-init){opacity: 0}';
        const revealCssMobile = selector + '[data-aos]{opacity: 1}';

        if (!!settings?.['reveal-mobile']) {
            css += revealCss;
        } else {
            //css += revealCssMobile;
            css += '@media screen and (min-width: ' + breakpoint + '){';
            css += revealCss;
            css += '}';
        }

        css += selector + '{';
        css += '--aos-distance: ' + (settings?.['reveal-distance'] || 120) + 'px;';

        css += '}';
    }

    if (settings?.position === 'fixed-push') {

        css += selector + ' + * {';
        css += '--offset-height: ' + offsetHeight + ' !important;';
        css += 'margin-top:' + height + ' !important;';
        css += '}';

    }

    if (settings?.['position-mobile'] === 'fixed-push') {

        css += '@media screen and (max-width: ' + breakpoint + '){';
        css += selector + ' + * {';
        css += '--offset-height: ' + offsetHeightMobile + ' !important;';
        css += 'margin-top:' + heightMobile + ' !important;';
        css += '}}';

    }

    if (Object.keys(mobile).length) {

        css += '@media screen and (max-width: ' + breakpoint + '){' + selector + '{';

        Object.entries(mobile).forEach(([prop, value]) => {
            css += [prop, value].join(':') + ' !important;';
        })

        css += '--offset-height: ' + offsetHeightMobile + ';';

        css += '}}';
    }

    if (Object.keys(hover).length) {
        css += selector + ':hover {';
        Object.entries(hover).forEach(([prop, value]) => {

            css += [prop, value].join(':') + ' !important;';
        })

        css += '}';
    }

    return css.trim();

}

function getProps(settings) {

    const result = {};

    if (!!settings?.reveal) {
        result['data-aos'] = settings?.reveal;
        result['data-aos-duration'] = settings?.['reveal-duration'] || 400;
        result['data-aos-easing'] = settings?.['reveal-easing'] || 'ease';
        result['data-aos-offset'] = settings?.['reveal-offset'] || 200;
        result['data-aos-once'] = !settings?.['reveal-repeat'];
        result['data-aos-mirror'] = !!settings?.['reveal-mirror'];
        result['data-aos-mirror'] = !!settings?.['reveal-mirror'];

        if (!settings?.['reveal-mobile']) {
            result['data-aos-disable'] = 'mobile';
        }
    }

    if (!!settings?.['hide-empty']) {
        result['data-hide-empty'] = 'all';
    }
    if (!!settings?.['required']) {
        result['data-required'] = 'all';
    }

    return result;

}

export function LayoutControls({attributes = {}, setAttributes}) {

    const [settings, setSettings] = useState(() => attributes['wpbs-layout'] || {});

    const editorColors = useMemo(() => {
        return wp.data.select('core/editor').getEditorSettings().colors || [];
    }, []);

    const resetAll_layout = useCallback(() => updateProp({
        ...attributes?.['wpbs-layout'] || {},
        ...Object.keys(LAYOUT_PROPS.layout).reduce((o, key) => ({...o, [key]: undefined}), {})
    }), [attributes['wpbs-layout'], setAttributes, setSettings]);

    const resetAll_mobile = useCallback(() => updateProp({
        ...attributes?.['wpbs-layout'] || {},
        ...Object.keys(LAYOUT_PROPS.mobile).reduce((o, key) => ({...o, [key]: undefined}), {})
    }), [attributes['wpbs-layout'], setAttributes, setSettings]);

    const resetAll_hover = useCallback(() => updateProp({
        ...attributes?.['wpbs-layout'] || {},
        ...Object.keys(LAYOUT_PROPS.hover).reduce((o, key) => ({...o, [key]: undefined}), {})
    }), [attributes['wpbs-layout'], setAttributes, setSettings]);


    const updateProp = useCallback((newValue) => {

        const result = {
            ...attributes['wpbs-layout'],
            ...newValue,
        }

        const props = {
            ...(attributes?.['wpbs-props'] ?? {}),
            ...getProps(result)
        }

        setAttributes(Object.fromEntries(Object.entries({
            'wpbs-layout': result,
            'wpbs-props': props,
            'wpbs-breakpoint': Object.fromEntries(Object.entries({
                ...(attributes?.['wpbs-breakpoint'] ?? {}),
                ...{
                    large: newValue?.breakpoint ?? null
                }
            }).filter(([k, value]) => value !== null)),
        }).filter(([k, value]) => value !== null)));

        setSettings(result);

    }, [attributes['wpbs-layout'], setAttributes, setSettings]);

    return <>
        <InspectorControls group="advanced">
            <Grid columns={1} columnGap={15} rowGap={20} style={{paddingTop: '20px'}}>
                <ToggleControl
                    __nextHasNoMarginBottom
                    label="Hide Empty"
                    checked={!!attributes?.['wpbs-layout-element']?.['hide-empty']}
                    onChange={(newValue) => updateProp({['hide-empty']: newValue})}
                />
                <ToggleControl
                    __nextHasNoMarginBottom
                    label="Required"
                    checked={!!attributes?.['wpbs-layout-element']?.['required']}
                    onChange={(newValue) => updateProp({['required']: newValue})}
                />
            </Grid>
        </InspectorControls>
        <InspectorControls group="styles">
            <PanelBody title={'Layout'} initialOpen={false} className={'wpbs-layout-tools'}>
                <Grid columns={1} className={'wpbs-layout-tools__grid'}>
                    <ToolsPanel label={'Style'} resetAll={resetAll_layout}>

                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['display']}
                            label={'Display'}
                            onDeselect={() => updateProp({'display': ''})}
                        >
                            <MemoSelectControl
                                label="Display"
                                options={DISPLAY_OPTIONS}
                                value={settings?.['display']}
                                callback={(newValue) => updateProp({'display': newValue})}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['flex-direction']}
                            label={'Direction'}
                            onDeselect={() => updateProp({'flex-direction': ''})}
                        >
                            <MemoSelectControl
                                label="Direction"
                                value={settings?.['flex-direction']}
                                callback={(newValue) => updateProp({'flex-direction': newValue})}
                                options={DIRECTION_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['container']}
                            label={'Container'}
                            onDeselect={() => updateProp({['container']: ''})}
                        >
                            <MemoSelectControl
                                label="Container"
                                value={settings?.['container']}
                                callback={(newValue) => updateProp({'container': newValue})}
                                options={CONTAINER_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['align-items']}
                            label={'Align'}
                            onDeselect={() => updateProp({['align-items']: ''})}
                        >
                            <MemoSelectControl
                                label="Align"
                                value={settings?.['align-items']}
                                callback={(newValue) => updateProp({'align-items': newValue})}
                                options={ALIGN_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['justify-content']}
                            label={'Justify'}
                            onDeselect={() => updateProp({['justify-content']: ''})}
                        >
                            <MemoSelectControl
                                label="Justify"
                                value={settings?.['justify-content']}
                                callback={(newValue) => updateProp({'justify-content': newValue})}
                                options={JUSTIFY_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 2'}}
                            hasValue={() => !!settings?.['opacity']}
                            label={'Opacity'}
                            onDeselect={() => updateProp({['opacity']: ''})}
                        >
                            <MemoRangeControl
                                label="Opacity"
                                value={settings?.['opacity']}
                                callback={(newValue) => updateProp({'opacity': newValue})}
                                step={.1}
                                min={0}
                                max={1}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 2'}}
                            hasValue={() => !!settings?.['basis']}
                            label={'Basis'}
                            onDeselect={() => updateProp({['basis']: ''})}
                        >
                            <MemoRangeControl
                                label="Basis"
                                step={1}
                                value={settings?.['basis']}
                                callback={(newValue) => updateProp({'basis': newValue})}
                                min={0}
                                max={100}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['width']}
                            label={'Width'}
                            onDeselect={() => updateProp({['width']: ''})}
                        >
                            <MemoSelectControl
                                label="Width"
                                value={settings?.['width']}
                                callback={(newValue) => updateProp({'width': newValue})}
                                options={WIDTH_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['width-custom']}
                            label={'Width Custom'}
                            onDeselect={() => updateProp({['width-custom']: ''})}
                        >
                            <MemoUnitControl
                                label="Width Custom"
                                value={settings?.['width-custom']}
                                callback={(newValue) => updateProp({'width-custom': newValue})}
                                units={DIMENSION_UNITS}
                            />

                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!attributes['wpbs-layout']?.['max-width']}
                            label={'Max-Width'}
                            onDeselect={() => {
                                updateProp({['max-width']: ''})
                            }}
                        >
                            <MemoUnitControl
                                label="Max-Width"
                                value={settings?.['max-width']}
                                callback={(newValue) => updateProp({'max-width': newValue})}
                                units={DIMENSION_UNITS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['height']}
                            label={'Height'}
                            onDeselect={() => updateProp({'height': ''})}
                        >
                            <MemoSelectControl
                                label="Height"
                                value={settings?.['height']}
                                callback={(newValue) => updateProp({'height': newValue})}
                                options={HEIGHT_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['height-custom']}
                            label={'Height Custom'}
                            onDeselect={() => updateProp({['height-custom']: ''})}
                        >
                            <MemoUnitControl
                                label="Height Custom"
                                value={settings?.['height-custom']}
                                callback={(newValue) => updateProp({'height-custom': newValue})}
                                units={DIMENSION_UNITS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['offset-height']}
                            label={'Offset Height'}
                            onDeselect={() => updateProp({['offset-height']: ''})}
                        >
                            <MemoUnitControl
                                label="Offset Height"
                                value={settings?.['offset-height']}
                                min={-1000}
                                max={1000}
                                callback={(newValue) => updateProp({'offset-height': newValue})}
                                units={DIMENSION_UNITS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['min-height']}
                            label={'Min-Height'}
                            onDeselect={() => updateProp({['min-height']: ''})}
                        >
                            <MemoSelectControl
                                label="Min-Height"
                                value={settings?.['min-height']}
                                callback={(newValue) => updateProp({'min-height': newValue})}
                                options={HEIGHT_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['min-height-custom']}
                            label={'Min-Height Custom'}
                            onDeselect={() => updateProp({['min-height-custom']: ''})}
                        >
                            <MemoUnitControl
                                label="Min-Height Custom"
                                value={settings?.['min-height-custom']}
                                callback={(newValue) => updateProp({'min-height-custom': newValue})}
                                units={DIMENSION_UNITS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['max-height']}
                            label={'Max-Height'}
                            onDeselect={() => updateProp({['max-height']: ''})}
                        >
                            <MemoSelectControl
                                label="Max-Height"
                                value={settings?.['max-height']}
                                callback={(newValue) => updateProp({'max-height': newValue})}
                                options={HEIGHT_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['max-height-custom']}
                            label={'Max-Height Custom'}
                            onDeselect={() => updateProp({['max-height-custom']: ''})}
                        >
                            <MemoUnitControl
                                label="Max-Height Custom"
                                value={settings?.['max-height-custom']}
                                callback={(newValue) => updateProp({'max-height-custom': newValue})}
                                units={DIMENSION_UNITS}
                            />
                        </ToolsPanelItem>

                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['flex-wrap']}
                            label={'Flex Wrap'}
                            onDeselect={() => updateProp({['flex-wrap']: ''})}
                        >
                            <MemoSelectControl
                                label="Flex Wrap"
                                value={settings?.['flex-wrap']}
                                callback={(newValue) => updateProp({'flex-wrap': newValue})}
                                options={WRAP_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['flex-grow']}
                            label={'Grow'}
                            onDeselect={() => updateProp({['flex-grow']: ''})}
                        >
                            <MemoNumberControl
                                label="Grow"
                                value={settings?.['flex-grow']}
                                callback={(newValue) => updateProp({'flex-grow': newValue})}
                                min={0}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['flex-shrink']}
                            label={'Shrink'}
                            onDeselect={() => updateProp({['flex-shrink']: ''})}
                        >
                            <MemoNumberControl
                                label="Shrink"
                                value={settings?.['flex-shrink']}
                                callback={(newValue) => updateProp({'flex-shrink': newValue})}
                                min={0}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['position']}
                            label={'Position'}
                            onDeselect={() => updateProp({['position']: ''})}
                        >
                            <MemoSelectControl
                                label="Position"
                                value={settings?.['position']}
                                callback={(newValue) => updateProp({'position': newValue})}
                                options={POSITION_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['z-index']}
                            label={'Z-Index'}
                            onDeselect={() => updateProp({['z-index']: ''})}
                        >
                            <MemoNumberControl
                                label="Z-Index"
                                value={settings?.['z-index']}
                                callback={(newValue) => updateProp({'z-index': newValue})}
                                min={-100}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!settings?.['top'] || !!settings?.['right'] || !!settings?.['bottom'] || !!settings?.['left']}
                            label={'Box Position'}
                            onDeselect={() => updateProp({
                                top: '',
                                right: '',
                                bottom: '',
                                left: ''
                            })}
                        >
                            <Grid columns={2} columnGap={20} rowGap={20}
                                  style={{gridColumnStart: 1, gridColumnEnd: -1}}>

                                <MemoUnitControl
                                    label="Top"
                                    value={settings?.['top']}
                                    callback={(newValue) => updateProp({'top': newValue})}
                                />
                                <MemoUnitControl
                                    label="Right"
                                    value={settings?.['right']}
                                    callback={(newValue) => updateProp({'right': newValue})}
                                />
                                <MemoUnitControl
                                    label="Bottom"
                                    value={settings?.['bottom']}
                                    callback={(newValue) => updateProp({'bottom': newValue})}
                                />
                                <MemoUnitControl
                                    label="Left"
                                    value={settings?.['left']}
                                    callback={(newValue) => updateProp({'left': newValue})}
                                />

                                <ToggleControl
                                    __nextHasNoMarginBottom
                                    label="Align with Header"
                                    checked={!!settings?.['align-header']}
                                    onChange={(newValue) => updateProp({'align-header': newValue})}
                                />

                            </Grid>
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['overflow']}
                            label={'Overflow'}
                            onDeselect={() => updateProp({['overflow']: ''})}
                        >
                            <MemoSelectControl
                                label="Overflow"
                                value={settings?.['overflow']}
                                callback={(newValue) => updateProp({'overflow': newValue})}
                                options={OVERFLOW_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['aspect-ratio']}
                            label={'Shape'}
                            onDeselect={() => updateProp({['aspect-ratio']: ''})}
                        >
                            <MemoSelectControl
                                label="Shape"
                                value={settings?.['aspect-ratio']}
                                callback={(newValue) => updateProp({'aspect-ratio': newValue})}
                                options={SHAPE_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['order']}
                            label={'Order'}
                            onDeselect={() => updateProp({['order']: ''})}
                        >
                            <MemoNumberControl
                                label="Order"
                                value={settings?.['order']}
                                callback={(newValue) => updateProp({'order': newValue})}
                            />
                        </ToolsPanelItem>

                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['outline-offset']}
                            label={'Outline Offset'}
                            onDeselect={() => updateProp({['outline-offset']: ''})}
                        >
                            <MemoUnitControl
                                label="Outline Offset"
                                value={settings?.['outline-offset']}
                                callback={(newValue) => updateProp({'outline-offset': newValue})}
                                units={BORDER_UNITS}
                            />
                        </ToolsPanelItem>

                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['offset-header']}
                            label={'Offset Header'}
                            onDeselect={() => updateProp({['offset-header']: ''})}
                        >
                            <MemoNumberControl
                                label="Offset Header"
                                value={settings?.['offset-header']}
                                callback={(newValue) => updateProp({'offset-header': newValue})}
                            />
                        </ToolsPanelItem>

                        <ToolsPanelItem
                            hasValue={() => !!settings?.['translate']}
                            label={'Translate'}
                            onDeselect={() => updateProp({['translate']: ''})}
                        >
                            <MemoBoxControl
                                label={'Translate'}
                                sides={['top', 'left']}
                                value={settings?.['translate']}
                                callback={(newValue) => updateProp({'translate': newValue})}
                                inputProps={{
                                    min: -300,
                                    max: 300,
                                    units: DIMENSION_UNITS
                                }}
                            />
                        </ToolsPanelItem>

                        <ToolsPanelItem
                            hasValue={() => !!settings?.['outline']}
                            label={'Outline'}
                            onDeselect={() => updateProp({['outline']: ''})}
                        >
                            <MemoBorderControl
                                colors={editorColors}
                                label={'Outline'}
                                value={settings?.['outline']}
                                callback={(newValue) => updateProp({'outline': newValue})}
                            />
                        </ToolsPanelItem>

                        <ToolsPanelItem
                            style={{gridColumn: 'span 2'}}
                            hasValue={() => !!settings?.['transition']}
                            label={'Transition'}
                            onDeselect={() => updateProp({['transition']: ''})}
                        >

                            <FormTokenField
                                tokenizeOnSpace={true}
                                __experimentalExpandOnFocus={true}
                                label="Transition"
                                value={settings?.['transition']}
                                suggestions={[
                                    'opacity',
                                    'transform',
                                    'background-color',
                                    'color',
                                    'border-color',
                                    'all'
                                ]}
                                onChange={(newValue) => updateProp({'transition': newValue})}
                            />


                        </ToolsPanelItem>

                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['duration']}
                            label={'Duration'}
                            onDeselect={() => updateProp({'duration': ''})}
                        >

                            <UnitControl
                                isResetValueOnUnitChange={true}
                                __next40pxDefaultSize
                                step={50}
                                min={0}
                                max={900}
                                label="Duration"
                                value={settings?.['duration']}
                                onChange={(newValue) => updateProp({'duration': newValue})}
                                units={[
                                    {
                                        label: 'ms',
                                        value: 'ms',
                                        default: 0
                                    }
                                ]}
                            />


                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 2'}}
                            hasValue={() => !!settings?.['reveal']}
                            label={'Reveal'}
                            onDeselect={() => updateProp({'reveal': ''})}
                        >
                            <Grid columns={1} rowGap={20} columnGap={15}>
                                <Grid columns={2} columnGap={15}>

                                    <SelectControl
                                        __nextHasNoMarginBottom
                                        options={[
                                            {label: 'Select', value: ''},
                                            {label: 'Fade', value: 'fade'},
                                            {label: 'Fade Up', value: 'fade-up'},
                                            {label: 'Fade Down', value: 'fade-down'},
                                            {label: 'Fade Left', value: 'fade-left'},
                                            {label: 'Fade Right', value: 'fade-right'},
                                            {label: 'Fade Up Right', value: 'fade-up-right'},
                                            {label: 'Fade Up Left', value: 'fade-up-left'},
                                            {label: 'Fade Down Right', value: 'fade-down-right'},
                                            {label: 'Fade Down Left', value: 'fade-down-left'},
                                            {label: 'Flip Up', value: 'flip-up'},
                                            {label: 'Flip Down', value: 'flip-down'},
                                            {label: 'Flip Left', value: 'flip-left'},
                                            {label: 'Flip Right', value: 'flip-right'},
                                            {label: 'Slide Up', value: 'slide-up'},
                                            {label: 'Slide Down', value: 'slide-down'},
                                            {label: 'Slide Left', value: 'slide-left'},
                                            {label: 'Slide Right', value: 'slide-right'},
                                            {label: 'Zoom In', value: 'zoom-in'},
                                            {label: 'Zoom In Up', value: 'zoom-in-up'},
                                            {label: 'Zoom In Down', value: 'zoom-in-down'},
                                            {label: 'Zoom In Left', value: 'zoom-in-left'},
                                            {label: 'Zoom In Right', value: 'zoom-in-right'},
                                            {label: 'Zoom Out', value: 'zoom-out'},
                                            {label: 'Zoom Out Up', value: 'zoom-out-up'},
                                            {label: 'Zoom Out Down', value: 'zoom-out-down'},
                                            {label: 'Zoom Out Left', value: 'zoom-out-left'},
                                            {label: 'Zoom Out Right', value: 'zoom-out-right'},
                                        ]}
                                        __next40pxDefaultSize
                                        label="Animation"
                                        value={settings?.['reveal']}
                                        onChange={(newValue) => updateProp({'reveal': newValue})}

                                    />

                                    <SelectControl
                                        __nextHasNoMarginBottom
                                        label="Easing"
                                        value={settings?.['reveal-easing']}
                                        options={[
                                            {label: 'Select', value: ''},
                                            {label: 'Linear', value: 'linear'},
                                            {label: 'Ease In', value: 'ease-in'},
                                            {label: 'Ease Out', value: 'ease-out'},
                                            {label: 'Ease In Out', value: 'ease-in-out'},
                                            {label: 'Ease In Back', value: 'ease-in-back'},
                                            {label: 'Ease Out Back', value: 'ease-out-back'},
                                            {label: 'Ease In Out Back', value: 'ease-in-out-back'},
                                            {label: 'Ease In Circ', value: 'ease-in-circ'},
                                            {label: 'Ease Out Circ', value: 'ease-out-circ'},
                                            {label: 'Ease In Out Circ', value: 'ease-in-out-circ'},
                                            {label: 'Ease In Cubic', value: 'ease-in-cubic'},
                                            {label: 'Ease Out Cubic', value: 'ease-out-cubic'},
                                            {label: 'Ease In Out Cubic', value: 'ease-in-out-cubic'},
                                            {label: 'Ease In Quad', value: 'ease-in-quad'},
                                            {label: 'Ease Out Quad', value: 'ease-out-quad'},
                                            {label: 'Ease In Out Quad', value: 'ease-in-out-quad'},
                                            {label: 'Ease In Quart', value: 'ease-in-quart'},
                                            {label: 'Ease Out Quart', value: 'ease-out-quart'},
                                            {label: 'Ease In Out Quart', value: 'ease-in-out-quart'},
                                            {label: 'Ease In Quint', value: 'ease-in-quint'},
                                            {label: 'Ease Out Quint', value: 'ease-out-quint'},
                                            {label: 'Ease In Out Quint', value: 'ease-in-out-quint'},
                                        ]}
                                        onChange={(newValue) => updateProp({'reveal-easing': newValue})}
                                    />

                                    <NumberControl
                                        label={'Duration'}
                                        value={settings?.['reveal-duration']}
                                        min={0}
                                        step={50}
                                        onChange={(newValue) => updateProp({'reveal-duration': newValue})}
                                        __next40pxDefaultSize
                                    />

                                    <NumberControl
                                        label={'Offset'}
                                        value={settings?.['reveal-offset']}
                                        min={-900}
                                        max={900}
                                        step={10}
                                        onChange={(newValue) => updateProp({'reveal-offset': newValue})}
                                        __next40pxDefaultSize
                                    />
                                    <NumberControl
                                        label={'Distance'}
                                        value={settings?.['reveal-distance']}
                                        min={0}
                                        step={10}
                                        onChange={(newValue) => updateProp({'reveal-distance': newValue})}
                                        __next40pxDefaultSize
                                    />


                                </Grid>
                                <Grid columns={2} columnGap={15}>
                                    <ToggleControl
                                        __nextHasNoMarginBottom
                                        label="Repeat"
                                        checked={!!settings?.['reveal-repeat']}
                                        onChange={(newValue) => updateProp({'reveal-repeat': newValue})}
                                    />
                                    <ToggleControl
                                        __nextHasNoMarginBottom
                                        label="Mirror"
                                        checked={!!settings?.['reveal-mirror']}
                                        onChange={(newValue) => updateProp({'reveal-mirror': newValue})}
                                    />
                                    <ToggleControl
                                        __nextHasNoMarginBottom
                                        label="Mobile"
                                        checked={!!settings?.['reveal-mobile']}
                                        onChange={(newValue) => updateProp({'reveal-mobile': newValue})}
                                    />
                                </Grid>
                            </Grid>


                        </ToolsPanelItem>

                        <ToolsPanelItem
                            hasValue={() => !!settings?.['mask-image']}
                            label={'Mask'}
                            onDeselect={() => updateProp({
                                ['mask-image']: undefined,
                                ['mask-origin']: '',
                                ['mask-size']: ''
                            })}
                        >

                            <Grid columns={1} columnGap={15} rowGap={20} style={{gridColumn: '1/-1'}}>
                                <MemoMediaControl
                                    label={'Mask Image'}
                                    value={settings?.['mask-image']}
                                    callback={(newValue) => updateProp({
                                        'mask-image': {
                                            type: newValue.type,
                                            id: newValue.id,
                                            url: newValue.url,
                                            alt: newValue.alt,
                                            sizes: newValue.sizes,
                                        }
                                    })}
                                    allowedTypes={['image']}
                                    clear={(newValue) => updateProp({
                                        'mask-image': undefined,
                                    })}
                                />

                                <Grid columns={2} columnGap={15} rowGap={20}>
                                    <MemoSelectControl
                                        label="Origin"
                                        value={settings?.['mask-origin']}
                                        callback={(newValue) => updateProp({'mask-origin': newValue})}
                                        options={ORIGIN_OPTIONS}
                                    />
                                    <MemoSelectControl
                                        label="Size"
                                        value={settings?.['mask-size']}
                                        callback={(newValue) => updateProp({'mask-size': newValue})}
                                        options={IMAGE_SIZE_OPTIONS}
                                    />
                                </Grid>
                            </Grid>

                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!settings?.['text-decoration-color']}
                            label={'Text Decoration'}
                            onDeselect={() => updateProp({'text-decoration-color': ''})}
                        >
                            <ColorSelector
                                label={'Text Decoration'}
                                value={settings?.['text-decoration-color']}
                                onColorChange={(newValue) => updateProp({'text-decoration-color': newValue})}
                            />
                        </ToolsPanelItem>

                    </ToolsPanel>

                    <ToolsPanel label={'Mobile'} resetAll={resetAll_mobile}>


                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['display-mobile']}
                            label={'Display'}
                            onDeselect={() => updateProp({'display-mobile': ''})}
                        >
                            <MemoSelectControl
                                label="Display"
                                options={DISPLAY_OPTIONS}
                                value={settings?.['display-mobile']}
                                callback={(newValue) => updateProp({'display-mobile': newValue})}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['flex-direction-mobile']}
                            label={'Direction'}
                            onDeselect={() => updateProp({'flex-direction-mobile': ''})}
                        >
                            <MemoSelectControl
                                label="Direction"
                                value={settings?.['flex-direction-mobile']}
                                callback={(newValue) => updateProp({'flex-direction-mobile': newValue})}
                                options={DIRECTION_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['container-mobile']}
                            label={'Container'}
                            onDeselect={() => updateProp({['container-mobile']: ''})}
                        >
                            <MemoSelectControl
                                label="Container"
                                value={settings?.['container-mobile']}
                                callback={(newValue) => updateProp({'container-mobile': newValue})}
                                options={CONTAINER_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['align-items-mobile']}
                            label={'Align'}
                            onDeselect={() => updateProp({['align-items-mobile']: ''})}
                        >
                            <MemoSelectControl
                                label="Align"
                                value={settings?.['align-items-mobile']}
                                callback={(newValue) => updateProp({'align-items-mobile': newValue})}
                                options={ALIGN_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['justify-content-mobile']}
                            label={'Justify'}
                            onDeselect={() => updateProp({['justify-content-mobile']: ''})}
                        >
                            <MemoSelectControl
                                label="Justify"
                                value={settings?.['justify-content-mobile']}
                                callback={(newValue) => updateProp({'justify-content-mobile': newValue})}
                                options={JUSTIFY_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 2'}}
                            hasValue={() => !!settings?.['opacity-mobile']}
                            label={'Opacity'}
                            onDeselect={() => updateProp({['opacity-mobile']: ''})}
                        >
                            <MemoRangeControl
                                label="Opacity"
                                value={settings?.['opacity-mobile']}
                                callback={(newValue) => updateProp({'opacity-mobile': newValue})}
                                step={.1}
                                min={0}
                                max={1}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 2'}}
                            hasValue={() => !!settings?.['basis-mobile']}
                            label={'Basis'}
                            onDeselect={() => updateProp({['basis-mobile']: ''})}
                        >
                            <MemoRangeControl
                                label="Basis"
                                step={1}
                                value={settings?.['basis-mobile']}
                                callback={(newValue) => updateProp({'basis-mobile': newValue})}
                                min={0}
                                max={100}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['width-mobile']}
                            label={'Width'}
                            onDeselect={() => updateProp({['width-mobile']: ''})}
                        >
                            <MemoSelectControl
                                label="Width"
                                value={settings?.['width-mobile']}
                                callback={(newValue) => updateProp({'width-mobile': newValue})}
                                options={WIDTH_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['width-custom-mobile']}
                            label={'Width Custom'}
                            onDeselect={() => updateProp({['width-custom-mobile']: ''})}
                        >
                            <MemoUnitControl
                                label="Width Custom"
                                value={settings?.['width-custom-mobile']}
                                callback={(newValue) => updateProp({'width-custom-mobile': newValue})}
                                units={DIMENSION_UNITS}
                            />

                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['max-width-mobile']}
                            label={'Max-Width'}
                            onDeselect={() => {
                                updateProp({['max-width-mobile']: ''})
                            }}
                        >
                            <MemoUnitControl
                                label="Max-Width"
                                value={settings?.['max-width-mobile']}
                                callback={(newValue) => updateProp({'max-width-mobile': newValue})}
                                units={DIMENSION_UNITS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['height-mobile']}
                            label={'Height'}
                            onDeselect={() => updateProp({'height-mobile': ''})}
                        >
                            <MemoSelectControl
                                label="Height"
                                value={settings?.['height-mobile']}
                                callback={(newValue) => updateProp({'height-mobile': newValue})}
                                options={HEIGHT_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['height-custom-mobile']}
                            label={'Height Custom'}
                            onDeselect={() => updateProp({['height-custom-mobile']: ''})}
                        >
                            <MemoUnitControl
                                label="Height Custom"
                                value={settings?.['height-custom-mobile']}
                                callback={(newValue) => updateProp({'height-custom-mobile': newValue})}
                                units={DIMENSION_UNITS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['offset-height-mobile']}
                            label={'Offset Height'}
                            onDeselect={() => updateProp({['offset-height-mobile']: ''})}
                        >
                            <MemoUnitControl
                                label="Offset Height"
                                value={settings?.['offset-height-mobile']}
                                min={-1000}
                                max={1000}
                                callback={(newValue) => updateProp({'offset-height-mobile': newValue})}
                                units={DIMENSION_UNITS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['min-height-mobile']}
                            label={'Min-Height'}
                            onDeselect={() => updateProp({['min-height-mobile']: ''})}
                        >
                            <MemoSelectControl
                                label="Min-Height"
                                value={settings?.['min-height-mobile']}
                                callback={(newValue) => updateProp({'min-height-mobile': newValue})}
                                options={HEIGHT_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['min-height-custom-mobile']}
                            label={'Min-Height Custom'}
                            onDeselect={() => updateProp({['min-height-custom-mobile']: ''})}
                        >
                            <MemoUnitControl
                                label="Min-Height Custom"
                                value={settings?.['min-height-custom-mobile']}
                                callback={(newValue) => updateProp({'min-height-custom-mobile': newValue})}
                                units={DIMENSION_UNITS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['max-height-mobile']}
                            label={'Max-Height'}
                            onDeselect={() => updateProp({['max-height-mobile']: ''})}
                        >
                            <MemoSelectControl
                                label="Max-Height"
                                value={settings?.['max-height-mobile']}
                                callback={(newValue) => updateProp({'max-height-mobile': newValue})}
                                options={HEIGHT_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['max-height-custom-mobile']}
                            label={'Max-Height Custom'}
                            onDeselect={() => updateProp({['max-height-custom-mobile']: ''})}
                        >
                            <MemoUnitControl
                                label="Max-Height Custom"
                                value={settings?.['max-height-custom-mobile']}
                                callback={(newValue) => updateProp({'max-height-custom-mobile': newValue})}
                                units={DIMENSION_UNITS}
                            />
                        </ToolsPanelItem>

                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['flex-wrap-mobile']}
                            label={'Flex Wrap'}
                            onDeselect={() => updateProp({['flex-wrap-mobile']: ''})}
                        >
                            <MemoSelectControl
                                label="Flex Wrap"
                                value={settings?.['flex-wrap-mobile']}
                                callback={(newValue) => updateProp({'flex-wrap-mobile': newValue})}
                                options={WRAP_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['flex-grow-mobile']}
                            label={'Grow'}
                            onDeselect={() => updateProp({['flex-grow-mobile']: ''})}
                        >
                            <MemoNumberControl
                                label="Grow"
                                value={settings?.['flex-grow-mobile']}
                                callback={(newValue) => updateProp({'flex-grow-mobile': newValue})}
                                min={0}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['flex-shrink-mobile']}
                            label={'Shrink'}
                            onDeselect={() => updateProp({['flex-shrink-mobile']: ''})}
                        >
                            <MemoNumberControl
                                label="Shrink"
                                value={settings?.['flex-shrink-mobile']}
                                callback={(newValue) => updateProp({'flex-shrink-mobile': newValue})}
                                min={0}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['position-mobile']}
                            label={'Position'}
                            onDeselect={() => updateProp({['position-mobile']: ''})}
                        >
                            <MemoSelectControl
                                label="Position"
                                value={settings?.['position-mobile']}
                                callback={(newValue) => updateProp({'position-mobile': newValue})}
                                options={POSITION_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['z-index-mobile']}
                            label={'Z-Index'}
                            onDeselect={() => updateProp({['z-index-mobile']: ''})}
                        >
                            <MemoNumberControl
                                label="Z-Index"
                                value={settings?.['z-index-mobile']}
                                callback={(newValue) => updateProp({'z-index-mobile': newValue})}
                                min={-100}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!settings?.['top-mobile'] || !!settings?.['right-mobile'] || !!settings?.['bottom-mobile'] || !!settings?.['left-mobile']}
                            label={'Box Position'}
                            onDeselect={() => updateProp({
                                top: '',
                                right: '',
                                bottom: '',
                                left: ''
                            })}
                        >
                            <Grid columns={2} columnGap={20} rowGap={20}
                                  style={{gridColumnStart: 1, gridColumnEnd: -1}}>

                                <MemoUnitControl
                                    label="Top"
                                    value={settings?.['top-mobile']}
                                    callback={(newValue) => updateProp({'top-mobile': newValue})}
                                />
                                <MemoUnitControl
                                    label="Right"
                                    value={settings?.['right-mobile']}
                                    callback={(newValue) => updateProp({'right-mobile': newValue})}
                                />
                                <MemoUnitControl
                                    label="Bottom"
                                    value={settings?.['bottom-mobile']}
                                    callback={(newValue) => updateProp({'bottom-mobile': newValue})}
                                />
                                <MemoUnitControl
                                    label="Left"
                                    value={settings?.['left-mobile']}
                                    callback={(newValue) => updateProp({'left-mobile': newValue})}
                                />

                            </Grid>
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['overflow-mobile']}
                            label={'Overflow'}
                            onDeselect={() => updateProp({['overflow-mobile']: ''})}
                        >
                            <MemoSelectControl
                                label="Overflow"
                                value={settings?.['overflow-mobile']}
                                callback={(newValue) => updateProp({'overflow-mobile': newValue})}
                                options={OVERFLOW_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['aspect-ratio-mobile']}
                            label={'Shape'}
                            onDeselect={() => updateProp({['aspect-ratio-mobile']: ''})}
                        >
                            <MemoSelectControl
                                label="Shape"
                                value={settings?.['aspect-ratio-mobile']}
                                callback={(newValue) => updateProp({'aspect-ratio-mobile': newValue})}
                                options={SHAPE_OPTIONS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['order-mobile']}
                            label={'Order'}
                            onDeselect={() => updateProp({['order-mobile']: ''})}
                        >
                            <MemoNumberControl
                                label="Order"
                                value={settings?.['order-mobile']}
                                callback={(newValue) => updateProp({'order-mobile': newValue})}
                            />
                        </ToolsPanelItem>

                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['outline-offset-mobile']}
                            label={'Outline Offset'}
                            onDeselect={() => updateProp({['outline-offset-mobile']: ''})}
                        >
                            <MemoUnitControl
                                label="Outline Offset"
                                value={settings?.['outline-offset-mobile']}
                                callback={(newValue) => updateProp({'outline-offset-mobile': newValue})}
                                units={BORDER_UNITS}
                            />
                        </ToolsPanelItem>

                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['offset-header-mobile']}
                            label={'Offset Header'}
                            onDeselect={() => updateProp({['offset-header-mobile']: ''})}
                        >
                            <MemoNumberControl
                                label="Offset Header"
                                value={settings?.['offset-header-mobile']}
                                callback={(newValue) => updateProp({'offset-header-mobile': newValue})}
                            />
                        </ToolsPanelItem>

                        <ToolsPanelItem
                            hasValue={() => !!settings?.['translate-mobile']}
                            label={'Translate'}
                            onDeselect={() => updateProp({['translate-mobile']: ''})}
                        >
                            <MemoBoxControl
                                label={'Translate'}
                                sides={['top', 'left']}
                                value={settings?.['translate-mobile']}
                                callback={(newValue) => updateProp({'translate-mobile': newValue})}
                                inputProps={{
                                    min: -300,
                                    max: 300,
                                    units: DIMENSION_UNITS
                                }}
                            />
                        </ToolsPanelItem>

                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['offset-header-mobile']}
                            label={'Offset Header'}
                            onDeselect={() => updateProp({['offset-header-mobile']: ''})}
                        >
                            <MemoNumberControl
                                label="Offset Header"
                                value={settings?.['offset-header-mobile']}
                                callback={(newValue) => updateProp({'offset-header-mobile': newValue})}
                            />
                        </ToolsPanelItem>

                        <ToolsPanelItem
                            hasValue={() => !!settings?.['translate-mobile']}
                            label={'Translate'}
                            onDeselect={() => updateProp({['translate-mobile']: ''})}
                        >
                            <MemoBoxControl
                                label={'Translate'}
                                sides={['top', 'left']}
                                value={settings?.['translate-mobile']}
                                callback={(newValue) => updateProp({'translate-mobile': newValue})}
                                inputProps={{
                                    min: -300,
                                    max: 300,
                                    units: DIMENSION_UNITS
                                }}
                            />
                        </ToolsPanelItem>

                        <ToolsPanelItem
                            hasValue={() => !!settings?.['outline-mobile']}
                            label={'Outline'}
                            onDeselect={() => updateProp({['outline-mobile']: ''})}
                        >
                            <MemoBorderControl
                                colors={editorColors}
                                label={'Outline'}
                                value={settings?.['outline-mobile']}
                                callback={(newValue) => updateProp({'outline-mobile': newValue})}
                            />
                        </ToolsPanelItem>


                        <ToolsPanelItem
                            hasValue={() => !!settings?.['border-mobile']}
                            label={'Border'}
                            onDeselect={() => updateProp({['border-mobile']: ''})}
                        >
                            <MemoBorderControl
                                colors={editorColors}
                                label={'Border'}
                                value={settings?.['border-mobile']}
                                callback={(newValue) => updateProp({'border-mobile': newValue})}
                            />
                        </ToolsPanelItem>

                        <ToolsPanelItem
                            hasValue={() => !!settings?.['mask-image-mobile']}
                            label={'Mask'}
                            onDeselect={() => {
                                updateProp({
                                    ['mask-image-mobile']: undefined,
                                    ['mask-origin-mobile']: '',
                                    ['mask-size-mobile']: ''
                                });
                            }}
                        >

                            <Grid columns={1} columnGap={15} rowGap={20} style={{gridColumn: '1/-1'}}>
                                <MemoMediaControl
                                    label={'Mask Image'}
                                    value={settings?.['mask-image-mobile']}
                                    callback={(newValue) => updateProp({
                                        'mask-image-mobile': {
                                            type: newValue.type,
                                            id: newValue.id,
                                            url: newValue.url,
                                            alt: newValue.alt,
                                            sizes: newValue.sizes,
                                        }
                                    })}

                                    allowedTypes={['image']}
                                    clear={(newValue) => updateProp({
                                        'mask-image-mobile': undefined,
                                    })}
                                />

                                <Grid columns={2} columnGap={15} rowGap={20}>
                                    <MemoSelectControl
                                        label="Origin"
                                        value={settings?.['mask-origin-mobile']}
                                        callback={(newValue) => updateProp({'mask-origin-mobile': newValue})}
                                        options={ORIGIN_OPTIONS}
                                    />
                                    <MemoSelectControl
                                        label="Size"
                                        value={settings?.['mask-size-mobile']}
                                        callback={(newValue) => updateProp({'mask-size-mobile': newValue})}
                                        options={IMAGE_SIZE_OPTIONS}
                                    />
                                </Grid>
                            </Grid>

                        </ToolsPanelItem>


                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['breakpoint']}
                            label={'Breakpoint'}
                            onDeselect={() => updateProp({['breakpoint']: ''})}
                        >
                            <MemoSelectControl
                                label="Breakpoint"
                                value={settings?.['breakpoint']}
                                callback={(newValue) => updateProp({'breakpoint': newValue})}
                                options={[
                                    {label: 'Select', value: ''},
                                    {label: 'Extra Small', value: 'xs'},
                                    {label: 'Small', value: 'sm'},
                                    {label: 'Medium', value: 'md'},
                                    {label: 'Large', value: 'lg'},
                                    {label: 'Extra Large', value: 'xl'}
                                ]}
                            />
                        </ToolsPanelItem>

                        <ToolsPanelItem
                            hasValue={() => !!settings?.['padding-mobile']}
                            label={'Padding'}
                            onDeselect={() => updateProp({['padding-mobile']: ''})}
                        >
                            <MemoBoxControl
                                label={'Padding'}
                                value={settings?.['padding-mobile']}
                                callback={(newValue) => updateProp({'padding-mobile': newValue})}
                                inputProps={{
                                    units: DIMENSION_UNITS
                                }}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!settings?.['margin-mobile']}
                            label={'Margin'}
                            onDeselect={() => updateProp({['margin-mobile']: ''})}
                        >
                            <MemoBoxControl
                                label={'Margin'}
                                value={settings?.['margin-mobile']}
                                callback={(newValue) => updateProp({'margin-mobile': newValue})}
                                inputProps={{
                                    units: DIMENSION_UNITS
                                }}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!settings?.['gap-mobile']}
                            label={'Gap'}
                            onDeselect={() => updateProp({['gap-mobile']: ''})}
                        >
                            <MemoBoxControl
                                label={'Gap'}
                                value={settings?.['gap-mobile']}
                                callback={(newValue) => updateProp({'gap-mobile': newValue})}
                                inputProps={{
                                    units: DIMENSION_UNITS
                                }}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!settings?.['border-radius-mobile']}
                            label={'Rounded'}
                            onDeselect={() => updateProp({['border-radius-mobile']: ''})}
                        >
                            <MemoBoxControl
                                label={'Rounded'}
                                value={settings?.['border-radius-mobile']}
                                callback={(newValue) => updateProp({'border-radius-mobile': newValue})}
                                inputProps={{
                                    units: BORDER_UNITS
                                }}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['font-size-mobile']}
                            label={'Font Size'}
                            onDeselect={() => updateProp({['font-size-mobile']: ''})}
                        >
                            <MemoUnitControl
                                label="Font Size"
                                value={settings?.['font-size-mobile']}
                                callback={(newValue) => updateProp({'font-size-mobile': newValue})}
                                units={DIMENSION_UNITS}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['line-height-mobile']}
                            label={'Line Height'}
                            onDeselect={() => updateProp({['line-height-mobile']: ''})}
                        >
                            <MemoUnitControl
                                label="Line Heighe"
                                value={settings?.['line-height-mobile']}
                                callback={(newValue) => updateProp({'line-height-mobile': newValue})}
                                units={[
                                    {value: 'px', label: 'px', default: 0},
                                    {value: 'em', label: 'em', default: 0},
                                    {value: 'rem', label: 'rem', default: 0},
                                ]}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            style={{gridColumn: 'span 1'}}
                            hasValue={() => !!settings?.['text-align-mobile']}
                            label={'Text Align'}
                            onDeselect={() => updateProp({['text-align-mobile']: ''})}
                        >
                            <MemoSelectControl
                                label="Text Align"
                                value={settings?.['text-align-mobile']}
                                callback={(newValue) => updateProp({'text-align-mobile': newValue})}
                                options={[
                                    {label: 'Select', value: ''},
                                    {label: 'Left', value: 'left'},
                                    {label: 'Center', value: 'center'},
                                    {label: 'Right', value: 'right'},
                                    {label: 'Inherit', value: 'inherit'},
                                ]}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!settings?.['text-color-mobile']}
                            label={'Text'}
                            onDeselect={() => updateProp({'text-color-mobile': ''})}
                        >
                            <ColorSelector
                                label={'Text'}
                                value={settings?.['text-color-mobile']}
                                onColorChange={(newValue) => updateProp({'text-color-mobile': newValue})}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!settings?.['background-color-mobile']}
                            label={'Background'}
                            onDeselect={() => updateProp({'background-color-mobile': ''})}
                        >
                            <ColorSelector
                                label={'Background'}
                                value={settings?.['background-color-mobile']}
                                onColorChange={(newValue) => updateProp({'background-color-mobile': newValue})}
                            />
                        </ToolsPanelItem>

                    </ToolsPanel>


                    <ToolsPanel label={'Hover'} resetAll={resetAll_layout}>

                        <ToolsPanelItem
                            hasValue={() => !!settings?.['text-color-hover']}
                            label={'Text'}
                            onDeselect={() => updateProp({'text-color-hover': ''})}
                        >
                            <ColorSelector
                                label={'Text'}
                                value={settings?.['text-color-hover']}
                                onColorChange={(newValue) => updateProp({'text-color-hover': newValue})}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!settings?.['background-color-hover']}
                            label={'Background'}
                            onDeselect={() => updateProp({'background-color-hover': ''})}
                        >
                            <ColorSelector
                                label={'Background'}
                                value={settings?.['background-color-hover']}
                                onColorChange={(newValue) => updateProp({'background-color-hover': newValue})}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!settings?.['border-color-hover']}
                            label={'Border'}
                            onDeselect={() => updateProp({'border-color-hover': ''})}
                        >
                            <ColorSelector
                                label={'Border'}
                                value={settings?.['border-color-hover']}
                                onColorChange={(newValue) => updateProp({'border-color-hover': newValue})}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!settings?.['text-decoration-color-hover']}
                            label={'Text Decoration'}
                            onDeselect={() => updateProp({'text-decoration-color-hover': ''})}
                        >
                            <ColorSelector
                                label={'Text Decoration'}
                                value={settings?.['text-decoration-color-hover']}
                                onColorChange={(newValue) => updateProp({'text-decoration-color-hover': newValue})}
                            />
                        </ToolsPanelItem>
                        <ToolsPanelItem
                            hasValue={() => !!settings?.['shadow-hover']}
                            label={'Shadow'}
                            onDeselect={() => updateProp({'shadow-hover': ''})}
                        >
                            <ShadowSelector
                                label={'Shadow'}
                                value={settings?.['shadow-hover']}
                                onChange={(newValue) => updateProp({'shadow-hover': newValue})}
                            />
                        </ToolsPanelItem>


                    </ToolsPanel>

                </Grid>
            </PanelBody>


        </InspectorControls>
    </>

}