import React, {memo, useCallback, useEffect, useMemo, useState} from "react";
import {
    __experimentalBoxControl as BoxControl,
    __experimentalGrid as Grid,
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
    __experimentalUnitControl as UnitControl,
    BaseControl,
    Button,
    GradientPicker,
    PanelBody,
    RangeControl,
    SelectControl,
    TabPanel,
    TextControl,
    ToggleControl
} from "@wordpress/components";
import {InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings,} from "@wordpress/block-editor";
import {
    BLEND_OPTIONS,
    DIMENSION_UNITS,
    DIRECTION_OPTIONS,
    DISPLAY_OPTIONS,
    IMAGE_SIZE_OPTIONS,
    OBJECT_POSITION_OPTIONS,
    ORIGIN_OPTIONS,
    REPEAT_OPTIONS,
    RESOLUTION_OPTIONS
} from "Includes/config";
import {useInstanceId} from "@wordpress/compose";
import _ from 'lodash';
import PreviewThumbnail from "Components/PreviewThumbnail.js";


export const STYLE_ATTRIBUTES = {
    'uniqueId': {
        type: 'string'
    },
    'wpbs-css': {
        type: 'object',
        default: {},
    },
    'wpbs-preload': {
        type: 'array',
    },
    'wpbs-style': {
        type: 'object',
        default: {},
    }
}

const BACKGROUND_IMAGE_SLUGS = ['image-large', 'image-mobile', 'mask-image', 'mask-image-mobile'];
const BACKGROUND_VIDEO_SLUGS = ['video-large', 'video-mobile'];

const SPECIAL_FIELDS = [
    'gap',
    'margin',
    'border',
    'box-shadow',
    'transform',
    'filter',
    'hide-empty',
    'required',
    'offset-height',
    'align-header',
    'outline',
    'duration',
    'reveal',
    'reveal-easing',
    'reveal-duration',
    'reveal-offset',
    'reveal-distance',
    'reveal-repeat',
    'reveal-mirror',
    'transition',
    'breakpoint',
    'mask-image',
    'mask-repeat',
    'mask-size',
    'mask-origin',
    'basis',
    'height',
    'height-custom',
    'min-height',
    'min-height-custom',
    'max-height',
    'max-height-custom',
    'width',
    'width-custom',
    'translate',
    'offset-header',
    'text-color',
    'text-decoration-color',
    'position',
    'container',
    'padding',
    'shadow',
    'border',
    'border-radius',
    'background-color',
];

function cleanObject(obj) {
    return _.transform(obj, (result, value, key) => {
        if (_.isPlainObject(value)) {
            const cleaned = cleanObject(value);
            if (!_.isEmpty(cleaned)) {
                result[key] = cleaned;
            }
        } else if (!_.isNil(value) && value !== '') {
            result[key] = value;
        }
    }, {});
}

export function useUniqueId({name, attributes}) {


    const {uniqueId} = attributes;
    const prefix = (name ?? 'wpbs-block').replace(/[^a-z0-9]/gi, '-');
    const instanceId = useInstanceId(useUniqueId, prefix);

    return uniqueId || instanceId;
}

export function getCSSFromStyle(raw, presetKeyword = '') {
    if (raw == null) return '';

    // Handle objects (padding, margin, etc.)
    if (typeof raw === 'object' && !Array.isArray(raw)) {
        return Object.entries(raw)
            .map(([k, v]) => `${k}: ${getCSSFromStyle(v, presetKeyword)};`)
            .join(' ');
    }

    // Handle arrays (e.g., font-family, fallbacks)
    if (Array.isArray(raw)) {
        return raw.map(v => getCSSFromStyle(v, presetKeyword)).join(', ');
    }

    if (typeof raw !== 'string') return raw;

    // Handle custom variable format
    if (raw.startsWith('var:')) {
        const [source, type, name] = raw.slice(4).split('|');
        if (source && type && name) {
            return `var(--wp--${source}--${type}--${name})`;
        }
        return raw; // fallback if malformed
    }

    // Handle CSS variable directly
    if (raw.startsWith('--wp--')) {
        return `var(${raw})`;
    }

    // Handle presets (color, font-size, spacing, etc.)
    if (presetKeyword) {
        return `var(--wp--preset--${presetKeyword}--${raw})`;
    }

    return raw;
}

function cleanLayout(layoutObj) {
    return {
        props: _.omitBy(layoutObj.props || {}, (v) => v === null || v === undefined || v === ''),
        breakpoints: _.mapValues(layoutObj.breakpoints || {}, (bpProps) =>
            _.omitBy(bpProps, (v) => v === null || v === undefined || v === '')
        ),
        hover: _.omitBy(layoutObj.hover || {}, (v) => v === null || v === undefined || v === ''),
        classNames: layoutObj.classNames || '',
    };
}

function parseSpecialProps(props = {}) {
    const result = {};

    Object.entries(props).forEach(([key, val]) => {
        if (val == null) return;

        if (SPECIAL_FIELDS.includes(key)) {
            switch (key) {
                case 'margin':
                case 'padding':
                case 'gap':
                    result[`${key}-top`] = val.top ?? '0px';
                    result[`${key}-right`] = val.right ?? '0px';
                    result[`${key}-bottom`] = val.bottom ?? '0px';
                    result[`${key}-left`] = val.left ?? '0px';
                    break;
                default:
                    result[key] = val;
            }
        } else {
            result[key] = val;
        }
    });

    return result;
}

export function parseLayoutCSS(settings = {}) {
    const cssObj = {
        props: {},
        breakpoints: {},
        hover: {},
    };

    // Default props
    if (settings.props) {
        cssObj.props = parseSpecialProps(settings.props);
    }

    // Breakpoints
    if (settings.breakpoints) {
        Object.entries(settings.breakpoints).forEach(([bpKey, bpProps]) => {
            cssObj.breakpoints[bpKey] = parseSpecialProps(bpProps);
        });
    }

    // Hover
    if (settings.hover) {
        cssObj.hover = parseSpecialProps(settings.hover);
    }

    return cleanLayout(cssObj);
}

export const Style = ({attributes, name}) => {

    if (!attributes?.uniqueId) return null;

    const uniqueId = attributes.uniqueId;
    const selector = `.wp-block-${name.replace('/', '-')}` + `.${uniqueId}`;

    const cssString = useMemo(() => {
        if (!attributes['wpbs-css']) return '';

        const {'wpbs-css': parsedCss = {}} = attributes;

        const propsToCss = (props = {}) =>
            Object.entries(props)
                .map(([k, v]) => `${k}: ${v};`)
                .join(' ');

        let result = '';

        // 1. Default
        if (!_.isEmpty(parsedCss.props)) {
            result += `${selector} { ${propsToCss(parsedCss.props)} }`;
        }

        // 2. Breakpoints
        if (parsedCss.breakpoints) {
            Object.entries(parsedCss.breakpoints).forEach(([bpKey, bpProps]) => {
                const bp = WPBS?.settings?.breakpoints?.[bpKey];
                if (!bp || _.isEmpty(bpProps)) return;

                result += `@media (max-width: ${bp.size - 1}px) { ${selector} { ${propsToCss(bpProps)} } }`;
            });
        }

        // 3. Hover
        if (!_.isEmpty(parsedCss.hover)) {
            result += `${selector}:hover { ${propsToCss(parsedCss.hover)} }`;
        }

        return result;
    }, [attributes['wpbs-css'], selector]);

    if (!cssString) return null;

    return <style>{cssString}</style>;
};

function Layout({attributes = {}, layoutSettings = {}, setLayoutSettings}) {

    const breakpoints = useMemo(() => {
        const bps = WPBS?.settings?.breakpoints ?? {};
        return Object.entries(bps).map(([key, {label, size}]) => ({key, label, size}));
    }, []); // empty deps if breakpoints config is static

    const layoutAttrs = useMemo(() => layoutSettings, [layoutSettings]) || {};

    const layoutObj = useMemo(() => ({
        props: layoutAttrs.props || {},
        breakpoints: layoutAttrs.breakpoints || {},
        hover: layoutAttrs.hover || {},
    }), [layoutAttrs]);

    const setLayoutObj = useCallback(
        (newLayoutObj) => {

            setLayoutSettings(newLayoutObj);

        },
        [attributes, setLayoutSettings]
    );

    const updateLayoutItem = useCallback(
        (newProps, bpKey) => {
            const updatedBreakpoints = {
                ...layoutObj.breakpoints,
                [bpKey]: {
                    ...layoutObj.breakpoints[bpKey],
                    ...newProps,
                },
            };

            setLayoutObj({
                ...layoutObj,
                breakpoints: updatedBreakpoints,
            });
        },
        [layoutObj, setLayoutObj]
    );

    const updateDefaultLayout = useCallback(
        (newProps) => {
            setLayoutObj({
                ...layoutObj,
                props: {...layoutObj.props, ...newProps}
            });
        },
        [layoutObj, setLayoutObj]
    );

    const updateHoverItem = useCallback(
        (newProps) => {
            setLayoutObj({
                ...layoutObj,
                hover: {...layoutObj.hover, ...newProps},
            });
        },
        [layoutObj, setLayoutObj]
    );

    const addLayoutItem = useCallback(() => {
        const keys = Object.keys(layoutObj.breakpoints);
        if (keys.length >= 3) return;

        const availableBps = breakpoints
            .map((bp) => bp.key)
            .filter((bp) => !keys.includes(bp));
        if (!availableBps.length) return;

        const newKey = availableBps[0];
        setLayoutObj({
            ...layoutObj,
            breakpoints: {
                ...layoutObj.breakpoints,
                [newKey]: {},
            },
        });
    }, [layoutObj, breakpoints, setLayoutObj]);

    const removeLayoutItem = useCallback(
        (bpKey) => {
            const {[bpKey]: removed, ...rest} = layoutObj.breakpoints;
            setLayoutObj({
                ...layoutObj,
                breakpoints: rest,
            });
        },
        [layoutObj, setLayoutObj]
    );

    const layoutKeys = useMemo(() => {
        const keys = Object.keys(layoutObj.breakpoints || {});
        return keys.sort((a, b) => {
            const bpA = breakpoints.find((bp) => bp.key === a);
            const bpB = breakpoints.find((bp) => bp.key === b);

            const sizeA = bpA?.size || 0;
            const sizeB = bpB?.size || 0;

            return sizeA - sizeB;
        });
    }, [layoutObj?.breakpoints, breakpoints]);

    return <PanelBody title={'Layout'} initialOpen={false} className={'wpbs-layout-tools'}>
        <Grid columns={1} columnGap={5} className={'wpbs-layout-tools__grid'}>
            <ToolsPanel label="Default" resetAll={() => updateDefaultLayout({})}>
                <LayoutFields
                    bpKey="layout"
                    settings={layoutObj.props}
                    updateLayoutItem={updateDefaultLayout}
                    suppress={['padding', 'margin', 'gap']}
                />
            </ToolsPanel>

            <ToolsPanel label="Hover" resetAll={() => updateHoverItem({})}>
                <HoverFields hoverSettings={layoutObj.hover} updateHoverItem={updateHoverItem}/>
            </ToolsPanel>

            {layoutKeys.map((bpKey) => {
                const bp = breakpoints.find((b) => b.key === bpKey);
                const size = bp?.size ? `(${bp.size}px)` : '';
                const panelLabel = [bp ? bp.label : bpKey, size].filter(Boolean).join(' ');

                return (
                    <ToolsPanel key={bpKey} label={panelLabel} resetAll={() => updateLayoutItem({}, bpKey)}>

                        <ToolsPanelItem
                            isShownByDefault={true}
                            label="Breakpoint"
                            hasValue={() => !!bpKey}
                        >
                            <SelectControl
                                label="Breakpoint"
                                value={bpKey}
                                style={{gridColumn: 'span 2'}}
                                options={breakpoints
                                    .map((b) => ({
                                        value: b.key,
                                        label: b.label,
                                        disabled: b.key !== bpKey && layoutKeys.includes(b.key),
                                    }))}
                                onChange={(newBpKey) => {
                                    const newBreakpoints = {...layoutObj.breakpoints};
                                    newBreakpoints[newBpKey] = newBreakpoints[bpKey];
                                    delete newBreakpoints[bpKey];
                                    setLayoutObj({...layoutObj, breakpoints: newBreakpoints});
                                }}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                        </ToolsPanelItem>
                        <LayoutFields
                            bpKey={bpKey}
                            settings={layoutObj.breakpoints[bpKey]}
                            updateLayoutItem={updateLayoutItem}
                        />
                        <Button variant={'secondary'} onClick={() => removeLayoutItem(bpKey)} icon={'trash'}
                                style={{gridColumn: '1/-1'}}/>
                    </ToolsPanel>
                );
            })}

            <Button variant="primary" onClick={addLayoutItem}
                    style={{borderRadius: '0', width: '100%', gridColumn: '1/-1'}}
                    disabled={layoutKeys.length >= 3}>
                Add Breakpoint
            </Button>
        </Grid>
    </PanelBody>;
}

const Field = memo(({field, settings, callback, toolspanel = true}) => {
    const {type, slug, label, large = false, ...controlProps} = field;

    if (!type || !slug || !label) return null;

    const handleChange = useCallback(
        (val) => callback({[slug]: val}),
        [callback, slug]
    );

    let control;

    const classNames = [
        !!large ? 'col-span-full' : '!col-span-1',
    ].filter(Boolean).join(' ');

    switch (type) {
        case 'select':
            control = (
                <SelectControl
                    key={slug}
                    label={label}
                    value={settings?.[slug]}
                    onChange={callback}
                    {...controlProps}
                    className={classNames}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            );
            break;

        case 'text':
            control = (
                <TextControl
                    key={slug}
                    label={label}
                    value={settings?.[slug]}
                    onChange={callback}
                    {...controlProps}
                    className={classNames}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            );
            break;

        case 'toggle':
            control = (
                <ToggleControl
                    key={slug}
                    label={label}
                    checked={!!settings?.[slug]}
                    onChange={callback}
                    {...controlProps}
                    className={classNames}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            );
            break;

        case 'range':
            control = (
                <RangeControl
                    key={slug}
                    label={label}
                    value={settings?.[slug]}
                    onChange={callback}
                    {...controlProps}
                    className={classNames}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />

            );
            break;

        case 'color':
            control = (
                <PanelColorSettings
                    key={slug}
                    enableAlpha
                    className={'!p-0 !border-0 [&_.components-tools-panel-item]:!m-0 ' + classNames}
                    colorSettings={[
                        {
                            slug: slug,
                            label: label,
                            value: settings?.[slug],
                            onChange: callback,
                            isShownByDefault: true
                        }
                    ]}
                />
            );
            break;

        case 'gradient':
            control = (
                <BaseControl label={label} __nextHasNoMarginBottom={true} className={classNames}>
                    <GradientPicker
                        key={slug}
                        gradients={[
                            {
                                name: 'Transparent',
                                gradient:
                                    'linear-gradient(rgba(0,0,0,0),rgba(0,0,0,0))',
                                slug: 'transparent',
                            },
                            {
                                name: 'Light',
                                gradient:
                                    'linear-gradient(rgba(0,0,0,.3),rgba(0,0,0,.3))',
                                slug: 'light',
                            },
                            {
                                name: 'Strong',
                                gradient:
                                    'linear-gradient(rgba(0,0,0,.7),rgba(0,0,0,.7))',
                                slug: 'Strong',
                            }
                        ]}
                        clearable={true}
                        value={settings?.[slug]}
                        onChange={callback}
                        {...controlProps}
                    />
                </BaseControl>
            );
            break;

        case 'box':
            control = (
                <BoxControl
                    key={slug}
                    label={label}
                    values={settings?.[slug]}
                    onChange={callback}
                    {...controlProps}
                    className={classNames}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            );
            break;

        case 'unit':
            control = (
                <UnitControl
                    key={slug}
                    label={label}
                    value={settings?.[slug]}
                    onChange={callback}
                    {...controlProps}
                    className={classNames}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            );
            break;

        case 'image':
        case 'video': {
            const allowedTypes = type === 'image' ? ['image'] : ['video'];
            const value = settings?.[slug];
            const clear = () => callback('');

            control = (
                <BaseControl label={label} __nextHasNoMarginBottom className={classNames}>
                    <MediaUploadCheck>
                        <MediaUpload
                            key={slug}
                            title={label}
                            onSelect={callback}
                            allowedTypes={allowedTypes}
                            value={value}
                            render={({open}) => (
                                <PreviewThumbnail
                                    image={value}
                                    callback={clear}
                                    style={{objectFit: 'contain'}}
                                    onClick={open}
                                />
                            )}
                        />
                    </MediaUploadCheck>
                </BaseControl>
            );
            break;
        }

        default:
            control = null;
    }

    return (!!toolspanel ? <ToolsPanelItem
        className={classNames}
        label={label}
        hasValue={() => !!settings?.[slug]}
        onDeselect={() => handleChange('')}
    >
        {control}
    </ToolsPanelItem> : control);
});

const LayoutFields = memo(function LayoutFields({bpKey, settings, updateLayoutItem, suppress = []}) {
    const updateProp = useCallback(
        (newProps) => updateLayoutItem(newProps, bpKey),
        [updateLayoutItem, bpKey]
    );

    const fields = [
        {
            type: 'select',
            slug: 'display',
            label: 'Display',
            options: DISPLAY_OPTIONS
        },
        {
            type: 'select',
            slug: 'flex-direction',
            label: 'Direction',
            options: DIRECTION_OPTIONS
        },
        {
            type: 'box',
            slug: 'padding',
            label: 'Padding',
            large: true,
            options: {
                sides: ['top', 'right', 'bottom', 'left'],
                inputProps: {
                    units: DIMENSION_UNITS
                }
            }
        },
    ];

    return fields.filter((field) => !suppress.includes(field.slug)).map((field) => <Field field={field}
                                                                                          settings={settings}
                                                                                          callback={(newValue) => updateProp({[field.slug]: newValue})}/>);
});

const HoverFields = memo(function HoverFields({hoverSettings, updateHoverItem, suppress = []}) {
    const updateProp = useCallback(
        (newProps) => updateHoverItem(newProps),
        [updateHoverItem]
    );

    const fields = [
        {
            type: 'text',
            slug: 'background-color',
            label: 'Background Color'
        },
        {
            type: 'text',
            slug: 'text-color',
            label: 'Text Color'
        },
    ];

    return fields.filter((field) => !suppress.includes(field.slug)).map((field) => {
        return <Field field={field}
                      settings={hoverSettings}
                      callback={(newValue) => updateProp({[field.slug]: newValue})}
        />;
    });

});


function parseBackgroundCSS(settings = {}) {
    if (_.isEmpty(settings)) return {};

    const css = {};

    // Background type
    if (settings['type']) {
        css['--bg-type'] = settings['type'];
    }

    // Image URLs
    if (settings['large-image']?.url) {
        css['--bg-image-large'] = `url(${settings['large-image'].url})`;
    }
    if (settings['mobile-image']?.url) {
        css['--bg-image-mobile'] = `url(${settings['mobile-image'].url})`;
    }

    // Video URLs
    if (settings['large-video']?.url) {
        css['--bg-video-large'] = settings['large-video'].url;
    }
    if (settings['mobile-video']?.url) {
        css['--bg-video-mobile'] = settings['mobile-video'].url;
    }

    // Masks
    if (settings['mask-image-large']?.url) {
        css['--bg-mask-large'] = `url(${settings['mask-image-large'].url})`;
    }
    if (settings['mask-image-mobile']?.url) {
        css['--bg-mask-mobile'] = `url(${settings['mask-image-mobile'].url})`;
    }

    // Positioning
    if (settings['position']) {
        css['--bg-position'] = settings['position'];
    }
    if (settings['position-mobile']) {
        css['--bg-position-mobile'] = settings['position-mobile'];
    }

    // Size
    if (settings['size']) {
        css['--bg-size'] = settings['size'];
    }
    if (settings['size-mobile']) {
        css['--bg-size-mobile'] = settings['size-mobile'];
    }

    // Dimensions
    if (settings['width']) {
        css['--bg-width'] = settings['width'];
    }
    if (settings['height']) {
        css['--bg-height'] = settings['height'];
    }
    if (settings['width-mobile']) {
        css['--bg-width-mobile'] = settings['width-mobile'];
    }
    if (settings['height-mobile']) {
        css['--bg-height-mobile'] = settings['height-mobile'];
    }

    // Scale
    if (settings['scale']) {
        css['--bg-scale'] = settings['scale'];
    }
    if (settings['scale-mobile']) {
        css['--bg-scale-mobile'] = settings['scale-mobile'];
    }

    // Opacity
    if (settings['opacity']) {
        css['--bg-opacity'] = settings['opacity'];
    }
    if (settings['opacity-mobile']) {
        css['--bg-opacity-mobile'] = settings['opacity-mobile'];
    }

    // Extra flags
    if (settings['fixed']) {
        css['--bg-fixed'] = 'true';
    }
    if (settings['mask']) {
        css['--bg-mask'] = settings['mask'];
    }
    if (settings['fade']) {
        css['--bg-fade'] = settings['fade'];
    }
    if (settings['fade-mobile']) {
        css['--bg-fade-mobile'] = settings['fade-mobile'];
    }

    return css;
}


function normalizeBackgroundMedia(type, media, resolution = 'large') {
    if (!media) return {};

    switch (type) {
        case 'video':
            return {
                id: media.id ?? null,
                url: media.url ?? '',
            };

        case 'image':
            return {
                id: media.id ?? null,
                url: media.sizes?.[resolution]?.url ?? media.url ?? '',
                alt: media.alt ?? '',
                width: media.sizes?.[resolution]?.width ?? media.width ?? null,
                height: media.sizes?.[resolution]?.height ?? media.height ?? null,
            };

        default:
            return {};
    }
}

const BackgroundFields = ({attributes, backgroundSettings, setBackgroundSettings}) => {

    const settings = useMemo(() => backgroundSettings, [backgroundSettings]) || {};

    const breakpoints = useMemo(() => {
        const bps = WPBS?.settings?.breakpoints ?? {};
        return Object.entries(bps).map(([key, {label, size}]) => ({key, label, size}));
    }, []); // empty deps if breakpoints config is static

    const updateProp = useCallback(
        (slug, value) => {

            setBackgroundSettings((prevAttrs) => {

                let newValue;

                if (BACKGROUND_IMAGE_SLUGS.includes(slug)) {
                    newValue = normalizeBackgroundMedia('image', value);
                } else if (BACKGROUND_VIDEO_SLUGS.includes(slug)) {
                    newValue = normalizeBackgroundMedia('video', value);
                } else {
                    newValue = value;
                }

                return {
                    ...prevAttrs,
                    [slug]: newValue,
                };
            });

        },
        [setBackgroundSettings]
    );

    const sharedFields = {
        image: [
            {
                type: 'image',
                slug: 'image-mobile',
                label: 'Mobile Image',
            },
            {
                type: 'image',
                slug: 'image-large',
                label: 'Large Image',
            }
        ],
        video: [
            {
                type: 'video',
                slug: 'video-mobile',
                label: 'Mobile Video',
            },
            {
                type: 'video',
                slug: 'video-large',
                label: 'Large Video',
            }
        ],
        settings: [
            {
                type: 'toggle',
                slug: 'eager',
                label: 'Eager',
            },
            {
                type: 'toggle',
                slug: 'force',
                label: 'Force',
            },
            {
                type: 'toggle',
                slug: 'fixed',
                label: 'Fixed',
            },
        ]
    }

    const desktopFields = {
        image: [
            {
                type: 'select',
                label: 'Resolution',
                slug: 'resolution',
                options: RESOLUTION_OPTIONS
            },
            {
                type: 'select',
                label: 'Size',
                slug: 'size',
                options: IMAGE_SIZE_OPTIONS
            },
            {
                type: 'select',
                label: 'Blend',
                slug: 'blend',
                options: BLEND_OPTIONS
            },
            {
                type: 'select',
                label: 'Position',
                slug: 'position',
                options: OBJECT_POSITION_OPTIONS
            },
            {
                type: 'select',
                label: 'Origin',
                slug: 'origin',
                options: ORIGIN_OPTIONS
            },
            {
                type: 'unit',
                label: 'Max Height',
                slug: 'max-height',
                options: {
                    inputProps: {
                        units: [
                            {value: 'vh', label: 'vh', default: 0},
                        ]
                    }
                }

            },
            {
                type: 'select',
                label: 'Repeat',
                slug: 'repeat',
                options: REPEAT_OPTIONS
            },
        ],
        element: [
            {
                type: 'color',
                label: 'Color',
                slug: 'color',
            },
            {
                type: 'range',
                label: 'Scale',
                slug: 'scale',
                min: 0,
                max: 200,
            },
            {
                type: 'range',
                label: 'Opacity',
                slug: 'opacity',
                min: 0,
                max: 100,
            },
            {
                type: 'range',
                label: 'Width',
                slug: 'width',
                min: 0,
                max: 100,
            },
            {
                type: 'range',
                label: 'Height',
                slug: 'height',
                min: 0,
                max: 100,
            },
            {
                type: 'range',
                label: 'Fade',
                slug: 'fade',
                min: 0,
                max: 100,
            }
        ],
        mask: [
            {
                type: 'image',
                label: 'Mask Image',
                slug: 'mask-image',
                large: true
            },
            {
                type: 'select',
                label: 'Mask Origin',
                slug: 'mask-origin',
                options: ORIGIN_OPTIONS,
            },
            {
                type: 'select',
                label: 'Mask Size',
                slug: 'mask-size',
                options: IMAGE_SIZE_OPTIONS,
            },
            {
                type: 'gradient',
                label: 'Overlay',
                slug: 'overlay',
                large: true,
            }
        ]
    };

    const mobileFields = {
        image: [
            {
                type: 'select',
                label: 'Resolution',
                slug: 'resolution-mobile',
                options: RESOLUTION_OPTIONS
            },
            {
                type: 'select',
                label: 'Size',
                slug: 'size-mobile',
                options: IMAGE_SIZE_OPTIONS
            },
            {
                type: 'select',
                label: 'Blend',
                slug: 'blend-mobile',
                options: BLEND_OPTIONS
            },
            {
                type: 'select',
                label: 'Position',
                slug: 'position-mobile',
                options: OBJECT_POSITION_OPTIONS
            },
            {
                type: 'select',
                label: 'Origin',
                slug: 'origin-mobile',
                options: ORIGIN_OPTIONS
            },
            {
                type: 'unit',
                label: 'Max Height',
                slug: 'max-height-mobile',
                options: {
                    inputProps: {
                        units: [
                            {value: 'vh', label: 'vh', default: 0},
                        ]
                    }
                }
            },
            {
                type: 'select',
                label: 'Repeat',
                slug: 'repeat-mobile',
                options: REPEAT_OPTIONS
            },
        ],
        element: [
            {
                type: 'color',
                label: 'Color',
                slug: 'color-mobile',
            },
            {
                type: 'range',
                label: 'Scale',
                slug: 'scale-mobile',
                min: 0,
                max: 200,
            },
            {
                type: 'range',
                label: 'Opacity',
                slug: 'opacity-mobile',
                min: 0,
                max: 100,
            },
            {
                type: 'range',
                label: 'Width',
                slug: 'width-mobile',
                min: 0,
                max: 100,
            },
            {
                type: 'range',
                label: 'Height',
                slug: 'height-mobile',
                min: 0,
                max: 100,
            },
            {
                type: 'range',
                label: 'Fade',
                slug: 'fade-mobile',
                min: 0,
                max: 100,
            }
        ],
        mask: [
            {
                type: 'image',
                label: 'Mask Image',
                slug: 'mask-image-mobile',
                large: true
            },
            {
                type: 'select',
                label: 'Mask Origin',
                slug: 'mask-origin-mobile',
                options: ORIGIN_OPTIONS,
            },
            {
                type: 'select',
                label: 'Mask Size',
                slug: 'mask-size-mobile',
                options: IMAGE_SIZE_OPTIONS,
            },
            {
                type: 'gradient',
                label: 'Overlay',
                slug: 'overlay-mobile',
                large: true,
            }
        ]
    };

    const tabDesktop = <Grid columns={1} columnGap={15} rowGap={20}>
        <Grid columns={2} columnGap={15} rowGap={20}>
            {desktopFields.image.map((field) => <Field toolspanel={false} field={field}
                                                       settings={settings}
                                                       callback={(newValue) => updateProp(field.slug, newValue)}/>)}
        </Grid>

        <Grid columns={1} columnGap={15} rowGap={20}>
            {desktopFields.element.map((field) => <Field toolspanel={false} field={field}
                                                         settings={settings}
                                                         callback={(newValue) => updateProp(field.slug, newValue)}/>)}
        </Grid>

        <Grid columns={2} columnGap={15} rowGap={20}
              style={{padding: '1rem 0'}}>
            <Field
                toolspanel={false}
                field={{
                    type: 'toggle',
                    label: 'Mask',
                    slug: 'mask'
                }}
                settings={settings}
                callback={(newValue) => updateProp('mask', newValue)}
            />
        </Grid>

        <Grid columns={2} columnGap={15} rowGap={20} style={{display: !settings.mask ? 'none' : null}}>
            {desktopFields.mask.map((field) => <Field toolspanel={false} field={field}
                                                      settings={settings}
                                                      callback={(newValue) => updateProp(field.slug, newValue)}/>)}
        </Grid>
    </Grid>;

    const tabMobile = <Grid columns={1} columnGap={15} rowGap={20}>
        <Grid columns={2} columnGap={15} rowGap={20}>
            {mobileFields.image.map((field) => <Field toolspanel={false} field={field}
                                                      settings={settings}
                                                      callback={(newValue) => updateProp(field.slug, newValue)}/>)}
        </Grid>

        <Grid columns={1} columnGap={15} rowGap={20}>
            {mobileFields.element.map((field) => <Field toolspanel={false} field={field}
                                                        settings={settings}
                                                        callback={(newValue) => updateProp(field.slug, newValue)}/>)}
        </Grid>

        <Grid columns={2} columnGap={15} rowGap={20}
              style={{padding: '1rem 0'}}>
            <Field
                toolspanel={false}
                field={{
                    type: 'toggle',
                    label: 'Mask',
                    slug: 'mask-mobile'
                }}
                settings={settings}
                callback={(newValue) => updateProp('mask-mobile', newValue)}
            />
        </Grid>

        <Grid columns={2} columnGap={15} rowGap={20} style={{display: !settings?.['mask-mobile'] ? 'none' : null}}>
            {mobileFields.mask.map((field) => <Field toolspanel={false} field={field}
                                                     settings={settings}
                                                     callback={(newValue) => updateProp(field.slug, newValue)}/>)}
        </Grid>
    </Grid>;

    return <PanelBody title={'Background'} initialOpen={!!settings.type}>
        <Grid columns={1} columnGap={15} rowGap={20}>
            <Field
                toolspanel={false}
                field={{
                    type: 'select',
                    slug: 'type',
                    label: 'Type',
                    options: [
                        {label: 'Select', value: ''},
                        {label: 'Image', value: 'image'},
                        {label: 'Featured Image', value: 'featured-image'},
                        {label: 'Video', value: 'video'},
                    ]
                }}
                settings={settings}
                callback={(newValue) => updateProp('type', newValue)}
            />
            <Grid columns={1} columnGap={15} rowGap={20} style={{display: !settings.type ? 'none' : null}}>

                <Grid columns={2} columnGap={15} rowGap={20}
                      style={{display: settings.type === 'video' ? 'none' : null}}>
                    {sharedFields.image.map((field) => <Field toolspanel={false} field={field}
                                                              settings={settings}
                                                              callback={(newValue) => updateProp(field.slug, newValue)}/>)}
                </Grid>

                <Grid columns={2} columnGap={15} rowGap={20}
                      style={{display: settings.type !== 'video' ? 'none' : null}}>
                    {sharedFields.video.map((field) => <Field toolspanel={false} field={field}
                                                              settings={settings}
                                                              callback={(newValue) => updateProp(field.slug, newValue)}/>)}
                </Grid>

                <Grid columns={2} columnGap={15} rowGap={20}
                      style={{padding: '1rem 0'}}>

                    {sharedFields.settings.map((field) => <Field toolspanel={false} field={field}
                                                                 settings={settings}
                                                                 callback={(newValue) => updateProp(field.slug, newValue)}/>)}

                </Grid>

                <Field
                    toolspanel={false}
                    field={{
                        type: 'select',
                        slug: 'breakpoint',
                        label: 'Breakpoint',
                        options: breakpoints.map((b) => ({
                            value: b.key,
                            label: b.label,
                        }))
                    }}
                    settings={settings}
                    callback={(newValue) => updateProp('breakpoint', newValue)}
                />

                <TabPanel
                    className="wpbs-editor-tabs"
                    activeClass="active"
                    orientation="horizontal"
                    initialTabName="desktop"
                    tabs={[
                        {
                            name: 'desktop',
                            title: 'Desktop',
                            className: 'tab-desktop',
                        },
                        {
                            name: 'mobile',
                            title: 'Mobile',
                            className: 'tab-mobile',
                        },
                    ]}>
                    {(tab) => {
                        if (tab.name === 'desktop') return tabDesktop;
                        if (tab.name === 'mobile') return tabMobile;
                        return null;
                    }}
                </TabPanel>
            </Grid>
        </Grid>

    </PanelBody>;
}

const Background = ({attributes}) => {

    const {settings = {}} = attributes?.['wpbs-background'] ?? {};

    const bgClassnames = [
        'wpbs-background',
        !!settings?.video ? '--video' : null,
    ].filter(Boolean).join(' ');

    return <div className={bgClassnames}></div>;

}

const StyleElements = ({attributes, options = {}}) => {

    const result = [];

    if (!!options?.background) {
        result.push(<Background attributes={attributes}/>);
    }

    return <>{result}</>;
}

export function withStyle(EditComponent) {
    return (props) => {

        // Settings passed in from the block
        const [style, setStyle] = useState({});
        const {css = {}, background = false} = style;

        // Local settings
        const {attributes, setAttributes} = props;
        const {'wpbs-style': settings = {}} = attributes || {};

        const [layoutSettings, setLayoutSettings] = useState(settings?.layout ?? {});
        const [backgroundSettings, setBackgroundSettings] = useState(settings?.background ?? {});

        const uniqueId = useUniqueId(props);

        useEffect(() => {


            const layoutCss = parseLayoutCSS(layoutSettings);
            const backgroundCss = parseBackgroundCSS(backgroundSettings);

            const mergedCss = _.merge({}, backgroundCss, layoutCss, css);

            let result = {
                'wpbs-style': {},
                'wpbs-css': {},
            };

            if (!_.isEqual(layoutSettings, settings?.layout)) {
                result['wpbs-style'].layout = layoutSettings;
            }

            if (!_.isEqual(backgroundSettings, settings?.background)) {
                result['wpbs-style'].background = backgroundSettings;
            }

            if (!_.isEqual(mergedCss, attributes?.['wpbs-css'])) {
                result['wpbs-css'] = mergedCss;
            }

            result = cleanObject(result);

            if (!_.isEmpty(result)) {

                if (!attributes?.uniqueId) {
                    result.uniqueId = uniqueId;
                }

                setAttributes(result);
            }

        }, [layoutSettings, backgroundSettings, uniqueId, setAttributes]);


        return (
            <>
                <EditComponent
                    {...props}
                    setStyle={setStyle}
                    StyleElements={StyleElements}
                />
                <InspectorControls group={'styles'}>
                    <Layout {...props} layoutSettings={layoutSettings} setLayoutSettings={setLayoutSettings}/>
                    {!!background ? <BackgroundFields {...props} backgroundSettings={backgroundSettings}
                                                      setBackgroundSettings={setBackgroundSettings}/> : null}
                </InspectorControls>
                <Style {...props}/>
            </>
        );
    };
}
