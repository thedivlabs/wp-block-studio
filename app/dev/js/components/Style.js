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

const BACKGROUND_MEDIA_SLUGS = ['image-large', 'image-mobile', 'mask-image', 'mask-image-mobile', 'video-large', 'video-mobile'];

const SPECIAL_FIELDS = [
    'gap',
    'margin',
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

    return cssObj;
}

export const Style = ({attributes, name}) => {

    if (!attributes?.uniqueId) return null;

    const uniqueId = attributes.uniqueId;

    const cssString = useMemo(() => {
        if (!attributes['wpbs-css']?.props && !attributes['wpbs-css']?.breakpoints) return '';

        const selector = `.wp-block-${name.replace('/', '-')}` + `.${uniqueId}`;

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
    }, [attributes['wpbs-css'], name]);

    const cssBackgroundString = useMemo(() => {
        if (!attributes['wpbs-css']?.background) return '';

        const selector = `.wp-block-${name.replace('/', '-')}` + `.${uniqueId} > .wpbs-background`;

        const {background: parsedCss = {}} = attributes?.['wpbs-css'] ?? {};

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
    }, [attributes['wpbs-css'], name]);

    if (!cssString && !cssBackgroundString) return null;

    return <style>{[cssString, cssBackgroundString].join(' ').trim()}</style>;
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
                                    image={{
                                        ...value,
                                        type: settings?.type,
                                    }}
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

function imageSet(media, resolution) {

    const size = media?.sizes?.[resolution || 'large'];

    const url = size?.url ?? false;

    if (!url) {
        return '';
    }

    const ext = url.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const webp = 'url("' + [url, '.webp'].join('') + '") type("image/webp")';
    const fallback = 'url("' + url + '") type("' + ext + '")';

    return 'image-set(' + [webp, fallback].join(', ') + ')';

}

function parseBackgroundCSS(settings = {}) {
    if (_.isEmpty(settings)) return {props: {}, breakpoints: {}};

    const props = {};
    const breakpoints = {};

    const bpKey = settings.breakpoint || 'normal';

    const positionsMap = {
        'top-left': {
            '--top': '0px',
            '--left': '0px',
            '--bottom': 'auto',
            '--right': 'auto',
        },
        'top-right': {
            '--top': '0px',
            '--right': '0px',
            '--bottom': 'auto',
            '--left': 'auto',
        },
        'bottom-right': {
            '--bottom': '0px',
            '--right': '0px',
            '--top': 'auto',
            '--left': 'auto',
        },
        'bottom-left': {
            '--bottom': '0px',
            '--left': '0px',
            '--top': 'unset',
            '--right': 'unset',
        },
        'center': {
            '--top': '50%',
            '--left': '50%',
            '--bottom': 'unset',
            '--right': 'unset',
            '--transform': 'translate(-50%,-50%)',
        },
    };

    const imageLarge = !!settings?.force ? settings['image-large'] : settings['image-large'] || settings['image-mobile'];
    const imageMobile = !!settings?.force ? settings['image-mobile'] : settings['image-mobile'] || settings['image-large'];
    const maskImageLarge = settings['mask-image']?.sizes?.full?.url ? `url(${settings['mask-image']?.sizes?.full?.url})` : 'none';
    const maskImageMobile = settings['mask-image-mobile']?.sizes?.full?.url ? `url(${settings['mask-image-mobile']?.sizes?.full?.url})` : 'none';

    // Desktop / default props
    if (imageLarge) props['--image'] = imageSet(imageLarge, settings?.['resolution']);
    if (settings['size']) props['--size'] = settings['size'];
    if (settings['blend']) props['--blend'] = settings['blend'];
    if (settings['position']) Object.assign(props, positionsMap[settings?.position]);
    if (settings['origin']) props['--origin'] = settings['origin'];
    if (settings['max-height']) props['--max-height'] = settings['max-height'];
    if (settings['repeat']) props['--repeat'] = settings['repeat'];
    if (settings['scale']) props['--scale'] = settings['scale'] + '%';
    if (settings['opacity']) props['--opacity'] = parseInt(settings['opacity']) / 100;
    if (settings['width']) props['--width'] = settings['width'] + '%';
    if (settings['height']) props['--height'] = settings['height'] + '%';
    if (settings['fade']) props['--fade'] = `linear-gradient(to bottom, rgba(0, 0, 0, 1) ${settings['fade']}%,rgba(0, 0, 0, 0) 100%)`;
    if (settings['fixed']) props['--fixed'] = 'fixed';
    if (settings['color']) props['--color'] = settings['color'];
    if (settings['mask-image']) props['--mask-image'] = maskImageLarge;
    if (settings['mask-origin']) props['--mask-origin'] = settings['mask-origin'];
    if (settings['mask-size']) props['--mask-size'] = settings['mask-size'];
    if (settings['overlay']) props['--overlay'] = settings['overlay'];


    // Mobile / breakpoint props
    const bpProps = {};

    if (imageMobile) bpProps['--image'] = imageSet(imageMobile, settings?.['resolution-mobile']);
    if (settings['size-mobile']) bpProps['--size'] = settings['size-mobile'];
    if (settings['blend-mobile']) bpProps['--blend'] = settings['blend-mobile'];
    if (settings['position-mobile']) Object.assign(bpProps, positionsMap[settings?.['position-mobile']]);
    if (settings['origin-mobile']) bpProps['--origin'] = settings['origin-mobile'];
    if (settings['max-height-mobile']) bpProps['--max-height'] = settings['max-height-mobile'];
    if (settings['repeat-mobile']) bpProps['--repeat'] = settings['repeat-mobile'];
    if (settings['scale-mobile']) bpProps['--scale'] = settings['scale-mobile'] + '%';
    if (settings['opacity-mobile']) bpProps['--opacity'] = parseInt(settings['opacity-mobile']) / 100;
    if (settings['width-mobile']) bpProps['--width'] = settings['width-mobile'] + '%';
    if (settings['height-mobile']) bpProps['--height'] = settings['height-mobile'] + '%';
    if (settings['fade-mobile']) bpProps['--fade'] = `linear-gradient(to bottom, rgba(0, 0, 0, 1) ${settings['fade-mobile']}%,rgba(0, 0, 0, 0) 100%)`;
    if (settings['fixed-mobile']) bpProps['--fixed'] = 'fixed';
    if (settings['color-mobile']) bpProps['--color'] = settings['color-mobile'];
    if (settings['mask-image-mobile']) bpProps['--mask-image'] = maskImageMobile;
    if (settings['mask-origin-mobile']) bpProps['--mask-origin'] = settings['mask-origin-mobile'];
    if (settings['mask-size-mobile']) bpProps['--mask-size'] = settings['mask-size-mobile'];
    if (settings['overlay-mobile']) bpProps['--overlay'] = settings['overlay-mobile'];

    if (!_.isEmpty(bpProps)) breakpoints[bpKey] = bpProps;

    return cleanObject({props, breakpoints})
}

function normalizeBackgroundMedia(media) {
    if (!media) return {};

    return Object.fromEntries(Object.entries({
        id: media.id ?? null,
        sizes: media.sizes ?? null,
        url: media.url ?? null,
    }).filter(([key, value]) => !!value));
}

const BackgroundFields = ({backgroundSettings, setBackgroundSettings}) => {

    const settings = backgroundSettings;

    const breakpoints = useMemo(() => {
        const bps = WPBS?.settings?.breakpoints ?? {};
        return Object.entries(bps).map(([key, {label, size}]) => ({key, label, size}));
    }, []); // empty deps if breakpoints config is static

    const updateProp = useCallback(
        (slug, value) => {

            setBackgroundSettings((prevAttrs) => {

                let newValue;

                if (BACKGROUND_MEDIA_SLUGS.includes(slug)) {
                    newValue = normalizeBackgroundMedia(value);
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

    const tabFields = [
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
        {
            type: 'color',
            label: 'Color',
            slug: 'color',
            large: true,
        },
        {
            type: 'range',
            label: 'Scale',
            slug: 'scale',
            min: 0,
            max: 200,
            large: true,
        },
        {
            type: 'range',
            label: 'Opacity',
            slug: 'opacity',
            min: 0,
            max: 100,
            large: true,
        },
        {
            type: 'range',
            label: 'Width',
            slug: 'width',
            min: 0,
            max: 100,
            large: true,
        },
        {
            type: 'range',
            label: 'Height',
            slug: 'height',
            min: 0,
            max: 100,
            large: true,
        },
        {
            type: 'range',
            label: 'Fade',
            slug: 'fade',
            min: 0,
            max: 100,
            large: true,
        },
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
    ];

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


                        return (
                            <Grid columns={2} columnGap={15} rowGap={20}>
                                {tabFields.map((field) => {

                                    const slug = tab.name === 'mobile' && !field.slug.endsWith('-mobile')
                                        ? `${field.slug}-mobile`
                                        : field.slug;

                                    field.slug = slug;

                                    return <Field
                                        toolspanel={false}
                                        field={field}
                                        settings={settings}
                                        callback={(value) => updateProp(slug, value)}
                                    />;

                                })}
                            </Grid>
                        );
                    }}
                </TabPanel>
            </Grid>
        </Grid>

    </PanelBody>;
}

const MediaElement = ({settings, editor = true}) => {

    if (settings?.type === 'video') {

        const breakpoint = (WPBS?.settings?.breakpoints?.[settings?.breakpoint ?? 'normal']?.size ?? 1304) + 'px';

        let {'video-mobile': mobileVideo, 'video-large': largeVideo} = settings;

        if (!largeVideo && !mobileVideo) {
            return false;
        }

        if (!settings.force) {
            mobileVideo = mobileVideo || largeVideo || false;
            largeVideo = largeVideo || mobileVideo || false;
        } else {
            mobileVideo = mobileVideo || {};
            largeVideo = largeVideo || {};
        }

        let srcAttr;

        srcAttr = !!editor || !!settings?.eager ? 'src' : 'data-src';

        return <video muted loop autoPlay={true}>
            <source {...{
                [srcAttr]: largeVideo.url ? largeVideo.url : '#',
                type: 'video/mp4',
                'data-media': '(min-width:' + breakpoint + ')'
            }}/>
            <source {...{
                [srcAttr]: mobileVideo.url ? mobileVideo.url : '#',
                type: 'video/mp4',
                'data-media': '(width < ' + breakpoint + ')'
            }}/>
        </video>
    } else {
        return null;
    }
};

export const Background = ({attributes}) => {

    const {background: settings = {}} = attributes?.['wpbs-style'] ?? {};

    if (!settings.type) {
        return null;
    }

    const hasMask = !!settings?.['mask-image'] || !!settings?.['mask-image-mobile'];
    const isLazy = !settings?.eager;

    const bgClassnames = [
        'wpbs-background',
        `--${settings.type}`,
        isLazy ? '--lazy' : null,
        hasMask ? '--mask' : null,
    ].filter(Boolean).join(' ');


    return <div className={bgClassnames}>
        <MediaElement settings={settings}/>
    </div>;

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
            const mergedCss = cleanObject(_.merge({}, layoutCss, css, {background: backgroundCss}));

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

            if (!_.isEqual(mergedCss, cleanObject(attributes?.['wpbs-css']))) {
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
