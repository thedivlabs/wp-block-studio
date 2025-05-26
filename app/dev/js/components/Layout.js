import React, {useCallback, useEffect, useMemo, useState} from "react";

import {
    InspectorControls, MediaUpload, MediaUploadCheck,
    PanelColorSettings,
} from "@wordpress/block-editor";
import {
    __experimentalBorderControl as BorderControl,
    __experimentalBoxControl as BoxControl,
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
    __experimentalUnitControl as UnitControl, BaseControl,
    RangeControl,
    SelectControl,
} from "@wordpress/components";

import {getCSSFromStyle} from 'Components/Style';
import PreviewThumbnail from "Components/PreviewThumbnail.js";

export const LAYOUT_ATTRIBUTES = {
    'wpbs-layout': {
        type: 'object',
        default: {}
    }
};

const LAYOUT_PROPS = {
    special: [
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
        'container',
        'container-mobile',
    ],
    layout: [
        'offset-header',
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
    ],

    mobile: [
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
    ],

    colors: [
        'text-color-hover',
        'background-color-hover',
        'border-color-hover',
        'text-color-mobile',
        'background-color-mobile',
    ],

};

const DISPLAY_OPTIONS = [
    {label: 'Select', value: ''},
    {label: 'Flex', value: 'flex'},
    {label: 'Block', value: 'block'},
    {label: 'Inline Flex', value: 'inline-flex'},
    {label: 'Inline Block', value: 'inline-block'},
    {label: 'None', value: 'none'},
];

const DIRECTION_OPTIONS = [
    {label: 'Select', value: ''},
    {label: 'Row', value: 'row'},
    {label: 'Column', value: 'column'},
    {label: 'Row Reverse', value: 'row-reverse'},
    {label: 'Column Reverse', value: 'column-reverse'},
];

const CONTAINER_OPTIONS = [
    {label: 'Select', value: ''},
    {label: 'None', value: ''},
    {label: 'Extra Small', value: 'xs'},
    {label: 'Small', value: 'sm'},
    {label: 'Medium', value: 'md'},
    {label: 'Normal', value: 'normal'},
    {label: 'Large', value: 'lg'},
    {label: 'Extra Large', value: 'xl'},
];

const ALIGN_OPTIONS = [
    {label: 'Select', value: ''},
    {label: 'Start', value: 'start'},
    {label: 'Center', value: 'center'},
    {label: 'End', value: 'end'},
    {label: 'Stretch', value: 'stretch'},
];

const JUSTIFY_OPTIONS = [
    {label: 'Select', value: ''},
    {label: 'Start', value: 'flex-start'},
    {label: 'Center', value: 'center'},
    {label: 'End', value: 'flex-end'},
    {label: 'Between', value: 'space-between'},
]

const WIDTH_OPTIONS = [
    {label: 'Select', value: ''},
    {label: 'Auto', value: 'auto'},
    {label: 'Fit', value: 'fit-content'},
    {label: 'Full', value: '100%'},
]

const HEIGHT_OPTIONS = [
    {label: 'Select', value: ''},
    {label: 'Screen', value: 'screen'},
    {label: 'Full Screen', value: 'full-screen'},
    {label: 'Full', value: '100%'},
    {label: 'Auto', value: 'auto'},
    {label: 'Inherit', value: 'inherit'},
]

const WRAP_OPTIONS = [
    {label: 'Select', value: ''},
    {label: 'Wrap', value: 'wrap'},
    {label: 'No Wrap', value: 'no-wrap'},
]

const POSITION_OPTIONS = [
    {label: 'Select', value: ''},
    {label: 'Relative', value: 'relative'},
    {label: 'Absolute', value: 'absolute'},
    {label: 'Sticky', value: 'sticky'},
    {label: 'Static', value: 'static'},
]

const OVERFLOW_OPTIONS = [
    {label: 'Select', value: ''},
    {label: 'Hidden', value: 'hidden'},
    {label: 'Visible', value: 'visible'},
]

const SHAPE_OPTIONS = [
    {label: 'Select', value: ''},
    {label: 'Square', value: '1/1'},
    {label: 'Video', value: '16/9'},
    {label: 'Photo', value: '10/8'},
    {label: 'Tele', value: '5/6'},
    {label: 'Tall', value: '1/1.4'},
    {label: 'Auto', value: 'auto'},
]

const ORIGIN_OPTIONS = [
    {label: 'Default', value: ''},
    {label: 'Center', value: 'center'},
    {label: 'Top', value: 'top'},
    {label: 'Right', value: 'right'},
    {label: 'Bottom', value: 'bottom'},
    {label: 'Left', value: 'left'},
    {label: 'Top Left', value: 'top left'},
    {label: 'Top Right', value: 'top right'},
    {label: 'Bottom Left', value: 'bottom left'},
    {label: 'Bottom Right', value: 'bottom right'},
];

const IMAGE_SIZE_OPTIONS = [
    {label: 'Default', value: 'contain'},
    {label: 'Cover', value: 'cover'},
    {label: 'Vertical', value: 'auto 100%'},
    {label: 'Horizontal', value: '100% auto'},
];

const DIMENSION_UNITS = [
    {value: 'px', label: 'px', default: 0},
    {value: '%', label: '%', default: 0},
    {value: 'em', label: 'em', default: 0},
    {value: 'rem', label: 'rem', default: 0},
    {value: 'vh', label: 'vh', default: 0},
    {value: 'vw', label: 'vw', default: 0},
    {value: 'ch', label: 'ch', default: 0},
]

const BORDER_UNITS = [
    {value: 'px', label: 'px', default: 0},
    {value: '%', label: '%', default: 0},
    {value: 'em', label: 'em', default: 0},
    {value: 'rem', label: 'rem', default: 0},
]

const MemoMediaControl = React.memo(({label, allowedTypes, value, callback}) => (
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
                        callback={callback}
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
    <BorderControl
        label={label}
        value={value}
        enableAlpha={true}
        enableStyle={true}
        disableCustomColors={false}
        colors={colors}
        withSlider={true}
        onChange={callback}
        __experimentalIsRenderedInSidebar={true}
        __next40pxDefaultSize
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

function parseSpecial(prop, attributes) {

    const {'wpbs-layout': settings = {}} = attributes;

    if (!settings?.[prop]) {
        return {};
    }

    const value = settings[prop];

    const parsedProp = prop.replace(/-hover|-mobile/g, '');

    let result = {};

    switch (parsedProp) {
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
        case 'basis':
            result = {'flex-basis': value + '%'}
            break;
        case 'text-color':
            result = {'color': value}

            break;
        case 'height':
        case 'height-custom':
            result = {'height': settings?.['height-custom'] ?? settings?.['height'] ?? null}

            break;
        case 'min-height':
        case 'min-height-custom':
            result = {'min-height': settings?.['min-height-custom'] ?? settings?.['min-height'] ?? null}

            break;
        case 'max-height':
        case 'max-height-custom':
            result = {'max-height': settings?.['max-height-custom'] ?? settings?.['max-height'] ?? null}

            break;
        case 'width':
            break;
        case 'width-custom':
            result = {'width': settings?.['width-custom'] ?? settings?.['width'] ?? null}

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
    }

    Object.entries(result).forEach(([k, val]) => {

        if (typeof val === 'object') {
            result[k] = Object.entries(val)
                .filter(([_, v]) => v !== undefined && v !== null)
                .map(([k, v]) => `${k}: ${v};`)
                .join(' ');
        }
    });

    return result;


}

export function layoutCss(attributes) {

    return useMemo(() => {

        if (!Object.keys(attributes?.['wpbs-layout'] ?? {}).length || !attributes.uniqueId) {
            return '';
        }

        const uniqueId = attributes?.uniqueId ?? '';
        const selector = '.' + uniqueId.trim().split(' ').join('.');
        const {breakpoints, containers} = WPBS?.settings ?? {};

        const breakpoint = breakpoints[attributes['wpbs-layout']?.breakpoint ?? 'normal'];
        const container = attributes?.['wpbs-layout']?.container ? containers[attributes?.['wpbs-layout']?.container] : false;

        const {'wpbs-layout': settings = {}} = attributes;

        let css = '';
        let desktop = {};
        let mobile = {};
        let hover = {};


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
                css += '--container-width: ' + container + '}';
            }

            css += '}';
        }

        if (Object.keys(mobile).length) {
            css += '@media(width < ' + breakpoint + '){' + selector + '{';

            Object.entries(mobile).forEach(([prop, value]) => {
                css += [prop, value].join(':') + ';';
            })

            css += '}}';
        }

        if (Object.keys(hover).length) {
            css += selector + ':hover {';
            Object.entries(desktop).forEach(([prop, value]) => {

                css += [prop, value].join(':') + ';';
            })

            css += '}';
        }

        return css.trim();
    }, [attributes['wpbs-layout'], attributes.uniqueId]);


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

    const updateProp = useCallback((newValue) => {

        const result = {
            ...attributes['wpbs-layout'],
            ...newValue,
        }

        setAttributes({
            'wpbs-layout': result
        });

        setSettings(result);

    }, [attributes['wpbs-layout'], setAttributes, setSettings]);

    return <InspectorControls group="styles">

        <ToolsPanel label={'Layout Large'} resetAll={resetAll_layout} columnGap={15} rowGap={20}>

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
                <Grid columns={2} columnGap={20} rowGap={20} style={{gridColumnStart: 1, gridColumnEnd: -1}}>

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
                hasValue={() => !!settings?.['mask-image']}
                label={'Mask'}
                onDeselect={() => updateProp({
                    ['mask-image']: {},
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


        </ToolsPanel>

        <ToolsPanel label={'Layout Mobile'} resetAll={resetAll_mobile}>


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
                <Grid columns={2} columnGap={20} rowGap={20} style={{gridColumnStart: 1, gridColumnEnd: -1}}>

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
                    label={'Outline'}
                    value={settings?.['outline-mobile']}
                    callback={(newValue) => updateProp({'outline-mobile': newValue})}
                />
            </ToolsPanelItem>

            <ToolsPanelItem
                hasValue={() => !!settings?.['mask-image-mobile']}
                label={'Mask'}
                onDeselect={() => {
                    updateProp({
                        ['mask-image-mobile']: {},
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


        </ToolsPanel>

        <PanelColorSettings
            title={'Additional Colors'}
            enableAlpha
            __experimentalIsRenderedInSidebar
            colorSettings={[
                {
                    slug: 'text-color-hover',
                    label: 'Text Hover'
                },
                {
                    slug: 'background-color-hover',
                    label: 'Background Hover'
                },
                {
                    slug: 'border-color-hover',
                    label: 'Border Hover'
                },
                {
                    slug: 'text-color-mobile',
                    label: 'Text Mobile'
                },
                {
                    slug: 'background-color-mobile',
                    label: 'Background Mobile'
                }
            ].map((color_control) => {
                return {
                    value: settings?.[color_control.slug],
                    onChange: (color) => updateProp({[color_control.slug]: color}),
                    label: color_control.label.trim(),
                    isShownByDefault: false
                }
            })}
        />

    </InspectorControls>;

}