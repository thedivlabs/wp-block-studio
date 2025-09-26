import React, {memo, useCallback, useEffect, useMemo} from "react";
import {isEqual} from "lodash";
import {cleanObject, useUniqueId} from "Includes/helper";
import {
    __experimentalGrid as Grid,
    __experimentalBoxControl as BoxControl,
    __experimentalToolsPanelItem as ToolsPanelItem, Button, PanelBody, SelectControl, TextControl
} from "@wordpress/components";
import {DIMENSION_UNITS, DIRECTION_OPTIONS, DISPLAY_OPTIONS} from "Includes/config";
import {ToolsPanel} from "@wordpress/components/src/tools-panel";
import {InspectorControls} from "@wordpress/block-editor";
import {select} from "@wordpress/data";


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


function getPreloadMedia(preloads) {

    let result = {};

    preloads.forEach((preloadItem) => {

        const {media, resolution = 'large', breakpoint = 'normal', mobile} = preloadItem;

        if (media.id) {
            result[media.id] = {
                id: media?.id,
                resolution: resolution,
                breakpoint: breakpoint,
                mobile: !!mobile
            }
        }
    })

    return result;

}

export const styleClassnames = (attributes = {}) => {

    const result = Object.entries(attributes)
        .filter(([key]) => key.startsWith('wpbs'))
        .flatMap(([_, value]) => value?.classNames ?? []);

    return result.filter(Boolean).join(' ').trim();
};

export const Style = ({
                          selector,
                          uniqueId,
                          attributes,
                          props = {},
                          deps = [],
                      }) => {

    if (!attributes || !uniqueId) {
        return null;
    }

    const dependencyValues = [...[...deps, ...['wpbs-layout']].map((key) => attributes[key]), attributes?.style, uniqueId];

    const cssString = useMemo(() => {

        const {'wpbs-css': settings = {}} = attributes;

        if (!settings) {
            return '';
        }

        selector = selector ? `.${selector}` : null;

        let css = ''; // ✅ initialize css

        const baseSelector = [selector, `.${uniqueId}`].filter(Boolean).join(' ');

        // ✅ Helper to safely stringify CSS props
        const propsToCss = (props = {}) =>
            Object.entries(props)
                .filter(([_, val]) =>
                    val !== undefined && val !== null && typeof val !== 'object'
                )
                .map(([key, val]) => `${key}: ${val};`)
                .join(' ');

        // 1. Default layout
        const defaultProps = {
            ...settings.props,
            ...settings.special?.props,
        };
        if (Object.keys(defaultProps).length) {
            css += `${baseSelector} { ${propsToCss(defaultProps)} }`;
        }

        // 2. Breakpoints
        if (settings.breakpoints) {
            Object.entries(settings.breakpoints).forEach(([bpKey, bpProps]) => {
                const bp = WPBS?.settings?.breakpoints?.[bpKey];
                if (!bp || !bpProps || Object.keys(bpProps).length === 0) return;

                const combinedProps = {
                    ...bpProps,
                    ...settings.special?.breakpoints?.[bpKey],
                };

                if (Object.keys(combinedProps).length) {
                    css += `@media (max-width: ${bp.size - 1}px) { ${baseSelector} { ${propsToCss(combinedProps)} } }`;
                }
            });
        }

        // 3. Hover
        const hoverProps = {
            ...settings.hover,
            ...settings.special?.hover,
        };
        if (Object.keys(hoverProps).length) {
            css += `${baseSelector}:hover { ${propsToCss(hoverProps)} }`;
        }

        return css;
    }, [dependencyValues]);

    if (!cssString) return null;

    return <style>{cssString}</style>;

}

function processSpecialValue(key, value, attributes = {}) {
    const settings = attributes['wpbs-layout'] || {};
    let result = {};

    switch (key) {
        case 'gap':
        case 'padding':
        case 'margin':
            result = {
                [`${key}-top`]: value?.top ?? '0px',
                [`${key}-right`]: value?.right ?? '0px',
                [`${key}-bottom`]: value?.bottom ?? '0px',
                [`${key}-left`]: value?.left ?? '0px',
            };
            break;


        default:
            result = {[key]: value};
            break;
    }

    Object.assign(result, props);

    // Flatten nested objects into CSS strings if necessary
    Object.entries(result).forEach(([k, v]) => {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            result[k] = Object.entries(v)
                .filter(([_, val]) => val !== undefined && val !== null)
                .map(([subK, val]) => `${subK}: ${val};`)
                .join(' ');
        }
    });

    return result;
}

function getAllBlocks(blocks) {
    return blocks.reduce((all, block) => {
        all.push(block);
        if (block.innerBlocks.length) {
            all.push(...getAllBlocks(block.innerBlocks));
        }
        return all;
    }, []);
}

export function updateStyle(
    setAttributes,
    attributes,
    props = {},
    breakpoints = {},
    hover = {}
) {

    const current = attributes['wpbs-css'] || {};
    const next = structuredClone(current);

    // Merge props
    next.props = {...(current.props || {})};
    for (const key in props) {
        const value = props[key];
        if (value === null) {
            delete next.props[key];
            delete next.special?.[key];
        } else {
            next.props[key] = value;

            // Update special if needed
            const specialValue = processSpecialValue(key, value, attributes);
            next.special = {...(next.special || {}), ...specialValue};
        }
    }

    // Merge breakpoints
    next.breakpoints = {...(current.breakpoints || {})};
    for (const bp in breakpoints) {
        next.breakpoints[bp] = {...(next.breakpoints[bp] || {})};
        for (const key in breakpoints[bp]) {
            const value = breakpoints[bp][key];
            if (value === null) {
                delete next.breakpoints[bp][key];
            } else {
                next.breakpoints[bp][key] = value;

                // Update special for breakpoint as well
                const specialValue = processSpecialValue(key, value, attributes);
                next.special = {...(next.special || {}), ...specialValue};
            }
        }
    }

    // Merge hover
    next.hover = {...(current.hover || {})};
    for (const key in hover) {
        const value = hover[key];
        if (value === null) {
            delete next.hover[key];
        } else {
            next.hover[key] = value;

            // Update special for hover if needed
            const specialValue = processSpecialValue(key, value, attributes);
            next.special = {...(next.special || {}), ...specialValue};
        }
    }

    setAttributes({'wpbs-css': next});
}


function generateUniqueId(clientId, attributes, prefix = 'wpbs-block') {
    const allBlocks = select('core/block-editor')
        .getBlocks()
        .flatMap(block => getAllBlocks([block])); // flatten nested blocks

    let id;
    do {
        id = `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
    } while (allBlocks.some(block => block.attributes?.uniqueId === id && block.clientId !== clientId));

    return id;
}

export function Layout({attributes, setAttributes, clientId}) {

    const breakpoints = useMemo(
        () => [
            ...Object.entries(WPBS?.settings?.breakpoints ?? {}).map(([key, {label, size}]) => ({
                key,
                label,
                size,
            })),
        ],
        [WPBS?.settings?.breakpoints]
    );

    // Ensure the new shape exists
    const layoutObj = {
        props: attributes['wpbs-layout']?.props || {},
        breakpoints: attributes['wpbs-layout']?.breakpoints || {},
        hover: attributes['wpbs-layout']?.hover || {},
        classNames: getClassnames(attributes),
    };


    const setLayoutObj = useCallback(
        (newObj) => {

            const uniqueId = attributes.uniqueId || generateUniqueId(clientId, attributes);

            setAttributes({...attributes, uniqueId: uniqueId, 'wpbs-layout': newObj});
        },
        [attributes, setAttributes]
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


            const cleanedBreakpoints = Object.fromEntries(
                Object.entries(updatedBreakpoints)
                    .map(([key, props]) => [
                        key,
                        Object.fromEntries(Object.entries(props).filter(([_, v]) => v !== '')),
                    ])
                    .filter(([_, props]) => Object.keys(props).length > 0)
            );

            const specialForBp = {...layoutObj.special?.breakpoints?.[bpKey]};

            Object.entries(newProps).forEach(([key, value]) => {
                if (SPECIAL_FIELDS.includes(key)) {
                    Object.assign(specialForBp, processSpecialValue(key, value, attributes));
                }
            });

            setLayoutObj({
                ...layoutObj,
                breakpoints: cleanedBreakpoints,
                special: {
                    ...layoutObj.special,
                    breakpoints: {
                        ...layoutObj.special?.breakpoints,
                        [bpKey]: specialForBp,
                    },
                },
            });
        },
        [layoutObj, setLayoutObj]
    );


    const updateDefaultLayout = useCallback(
        (newProps) => {
            const specialProps = {...layoutObj.special?.props};

            Object.entries(newProps).forEach(([key, value]) => {
                if (SPECIAL_FIELDS.includes(key)) {
                    Object.assign(specialProps, processSpecialValue(key, value, attributes));
                }
            });

            setLayoutObj({
                ...layoutObj,
                props: {...layoutObj.props, ...newProps}
            });
        },
        [layoutObj, setLayoutObj]
    );


    const updateHoverItem = useCallback(
        (newProps) => {
            const specialHover = {...layoutObj.special?.hover};

            Object.entries(newProps).forEach(([key, value]) => {
                if (SPECIAL_FIELDS.includes(key)) {
                    Object.assign(specialHover, processSpecialValue(key, value, attributes));
                }
            });

            setLayoutObj({
                ...layoutObj,
                hover: {...layoutObj.hover, ...newProps},
                special: {
                    ...layoutObj.special,
                    hover: specialHover,
                },
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


    return (
        <PanelBody title={'Layout'} initialOpen={false} className={'wpbs-layout-tools'}>
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
        </PanelBody>
    );
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

const Field = memo(({field, settings, callback}) => {
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

    return (
        <ToolsPanelItem
            style={{gridColumn: !!large ? '1/-1' : 'span 1'}}
            label={label}
            hasValue={() => !!settings?.[slug]}
            onDeselect={() => handleChange('')}
        >
            {control}
        </ToolsPanelItem>
    );
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