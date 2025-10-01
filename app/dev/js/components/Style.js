import {memo, useCallback, useEffect, useMemo, useState} from "react";
import {
    __experimentalGrid as Grid,
    __experimentalBoxControl as BoxControl,
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
    Button, PanelBody, SelectControl, TextControl, TabPanel
} from "@wordpress/components";
import {
    BLEND_OPTIONS,
    DIMENSION_UNITS,
    DIRECTION_OPTIONS,
    DISPLAY_OPTIONS,
    IMAGE_SIZE_OPTIONS, ORIGIN_OPTIONS,
    RESOLUTION_OPTIONS,
    OBJECT_POSITION_OPTIONS, REPEAT_OPTIONS
} from "Includes/config";
import {InspectorControls} from "@wordpress/block-editor";
import {useInstanceId} from "@wordpress/compose";
import _ from 'lodash';


export const STYLE_ATTRIBUTES = {
    'uniqueId': {
        type: 'string'
    },
    'wpbs-layout': {
        type: 'object',
        default: {},
    },
    'wpbs-css': {
        type: 'object',
        default: {},
    },
    'wpbs-preload': {
        type: 'array',
    },
    'wpbs-background': {
        type: 'object',
    }
}

const BACKGROUND_SPECIAL_PROPS = [
    'type',
    'mobileImage',
    'largeImage',
    'mobileVideo',
    'largeVideo',
    'maskImageMobile',
    'maskImageLarge',
    'resolution',
    'position',
    'positionMobile',
    'eager',
    'force',
    'mask',
    'fixed',
    'size',
    'sizeMobile',
    'opacity',
    'width',
    'height',
    'resolutionMobile',
    'maskMobile',
    'scale',
    'scaleMobile',
    'opacityMobile',
    'widthMobile',
    'heightMobile',
    'fade',
    'fadeMobile',
];

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

/**
 * Flattens special field values into CSS-ready props.
 */
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

/**
 * Parses the layout object and returns the flattened wpbs-css object.
 */
export function parseLayoutForCSS(settings = {}) {
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

function Layout({attributes, setAttributes, css = {}, uniqueId}) {

    const breakpoints = useMemo(() => {
        const bps = WPBS?.settings?.breakpoints ?? {};
        return Object.entries(bps).map(([key, {label, size}]) => ({key, label, size}));
    }, []); // empty deps if breakpoints config is static

    const layoutAttrs = useMemo(() => attributes?.['wpbs-layout'] ?? {}, [attributes?.['wpbs-layout']]) || {};

    const classNames = useMemo(() => {
        return Object.entries(attributes)
            .filter(([key]) => key.startsWith('wpbs'))
            .flatMap(([_, value]) => value?.classNames ?? [])
            .filter(Boolean)
            .join(' ')
            .trim();
    }, [attributes]);

    const layoutObj = useMemo(() => ({
        props: layoutAttrs.props || {},
        breakpoints: layoutAttrs.breakpoints || {},
        hover: layoutAttrs.hover || {},
        classNames,
    }), [layoutAttrs, classNames]);

    const setLayoutObj = useCallback(
        (newLayoutObj) => {
            // Compute merged CSS directly
            const mergedCss = cleanLayout(_.merge({}, parseLayoutForCSS(newLayoutObj), css));

            const update = {'wpbs-layout': newLayoutObj};

            // Only update if CSS changed
            if (!_.isEqual(mergedCss, attributes?.['wpbs-css'])) {
                update['wpbs-css'] = mergedCss;
            }

            // Ensure uniqueId is set once
            if (!attributes?.uniqueId && uniqueId) {
                update.uniqueId = uniqueId;
            }

            setAttributes(update);
        },
        [attributes, setAttributes, uniqueId, css] // `css` is the current memoCss
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

const Field = memo(({field, settings, callback, toolspanel = true}) => {
    const {type, slug, label, options, large = false} = field;

    if (!type || !slug || !label) return null;

    const handleChange = useCallback(
        (val) => callback({[slug]: val}),
        [callback, slug]
    );

    let control = null;

    switch (type) {
        case 'select':
            control = (
                <SelectControl
                    label={label}
                    value={settings?.[slug]}
                    options={options}
                    onChange={handleChange}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            );
            break;
        case 'text':
            control = (
                <TextControl
                    label={label}
                    value={settings?.[slug]}
                    onChange={handleChange}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            );
            break;
        case 'box':
            control = (
                <BoxControl
                    label={label}
                    values={settings?.[slug]}
                    onChange={handleChange}
                    {...options}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            )
            break;
        default:
            control = null;
    }

    return (!!toolspanel ? <ToolsPanelItem
        style={{gridColumn: !!large ? '1/-1' : 'span 1'}}
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
                                                                                          callback={updateProp}/>);
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
                      callback={updateProp}/>;
    });

});

const BackgroundFields = ({attributes, setAttributes}) => {

    const {'wpbs-background': settings = {}} = attributes || {};

    const updateProp = useCallback(
        (newProps) => {
            setAttributes((prevAttrs) => ({
                'wpbs-background': {
                    ...prevAttrs['wpbs-background'], // always use latest
                    ...newProps
                }
            }));
        },
        [setAttributes] // don't include settings
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
            }
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
                units: [
                    {value: 'vh', label: 'vh', default: 0},
                ]
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
                units: [
                    {value: 'vh', label: 'vh', default: 0},
                ]
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
                                                       callback={updateProp}/>)}
        </Grid>

        <Grid columns={1} columnGap={15} rowGap={20}>
            {desktopFields.element.map((field) => <Field toolspanel={false} field={field}
                                                         settings={settings}
                                                         callback={updateProp}/>)}
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
                callback={updateProp}
            />
        </Grid>

        <Grid columns={2} columnGap={15} rowGap={20} style={{display: !settings.mask ? 'none' : null}}>
            {desktopFields.mask.map((field) => <Field toolspanel={false} field={field}
                                                      settings={settings}
                                                      callback={updateProp}/>)}
        </Grid>
    </Grid>;

    const tabMobile = <Grid columns={1} columnGap={15} rowGap={20}>
        <Grid columns={2} columnGap={15} rowGap={20}>
            {mobileFields.image.map((field) => <Field toolspanel={false} field={field}
                                                      settings={settings}
                                                      callback={updateProp}/>)}
        </Grid>

        <Grid columns={1} columnGap={15} rowGap={20}>
            {mobileFields.element.map((field) => <Field toolspanel={false} field={field}
                                                        settings={settings}
                                                        callback={updateProp}/>)}
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
                callback={updateProp}
            />
        </Grid>

        <Grid columns={2} columnGap={15} rowGap={20} style={{display: !settings.mask ? 'none' : null}}>
            {mobileFields.mask.map((field) => <Field toolspanel={false} field={field}
                                                     settings={settings}
                                                     callback={updateProp}/>)}
        </Grid>
    </Grid>;

    const tabs = {
        mobile: tabMobile,
        desktop: tabDesktop,
    }

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
                callback={updateProp}
            />
            <Grid columns={1} columnGap={15} rowGap={20} style={{display: !settings.type ? 'none' : null}}>

                <Grid columns={2} columnGap={15} rowGap={20}
                      style={{display: settings.type !== 'image' && settings.type !== 'featured-image' ? 'none' : null}}>
                    {sharedFields.image.map((field) => <Field toolspanel={false} field={field}
                                                              settings={settings}
                                                              callback={updateProp}/>)}
                </Grid>

                <Grid columns={2} columnGap={15} rowGap={20}
                      style={{display: settings.type !== 'video' ? 'none' : null}}>
                    {sharedFields.video.map((field) => <Field toolspanel={false} field={field}
                                                              settings={settings}
                                                              callback={updateProp}/>)}
                </Grid>

                <Grid columns={2} columnGap={15} rowGap={20}
                      style={{padding: '1rem 0'}}>

                    {sharedFields.settings.map((field) => <Field toolspanel={false} field={field}
                                                                 settings={settings}
                                                                 callback={updateProp}/>)}

                </Grid>

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
                    {
                        (tab) => (<>{tabs[tab.name]}</>)
                    }
                </TabPanel>
            </Grid>
        </Grid>

    </PanelBody>;
}

const Background = ({attributes}) => {

    const {'wpbs-background': settings = {}} = attributes || {};

    const bgClassnames = [
        'wpbs-background',
        !!settings?.video ? '--video' : null,
    ].filter(Boolean).join(' ');

    return <span className={bgClassnames}></span>;
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

        const [css, setCss] = useState({});
        const [styleOptions, setStyleOptions] = useState([]);

        const uniqueId = useUniqueId(props);

        return (
            <>
                <EditComponent {...props} setCss={setCss} setStyleOptions={setStyleOptions}
                               StyleElements={StyleElements}/>
                <InspectorControls group={'styles'}>
                    <Layout {...props} uniqueId={uniqueId} css={css}/>
                    {!!styleOptions?.background ? <BackgroundFields {...props}/> : null}
                </InspectorControls>
                <Style {...props} />
            </>
        );
    };
}
