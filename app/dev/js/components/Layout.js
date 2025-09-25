import React, {memo, useCallback, useMemo, useState} from "react";

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
    SelectControl, ToggleControl, TextControl, Button, Icon, IconButton
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
import {__} from "@wordpress/i18n";
import {useSelect} from "@wordpress/data";

export const LAYOUT_ATTRIBUTES = {
    'wpbs-layout': {
        type: 'object',
        default: {}
    }
};

const getClassnames = (attributes = {}) => {

    const {'wpbs-layout': settings = {}} = attributes

    const classNames = [];

    if (settings?.['position'] === 'fixed-push') {
        classNames.push('--fixed-push');
    }

    return classNames.filter(Boolean).join(' ');


};

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

export function LayoutControls({attributes, setAttributes}) {
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
        special: attributes['wpbs-layout']?.special || {
            props: {},
            breakpoints: {},
            hover: {},
        },
        classNames: getClassnames(attributes),
    };


    const setLayoutObj = useCallback(
        (newObj) => {
            setAttributes({...attributes, 'wpbs-layout': newObj});
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
                props: {...layoutObj.props, ...newProps},
                special: {
                    ...layoutObj.special,
                    props: specialProps,
                },
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

