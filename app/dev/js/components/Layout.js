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
    {label: 'None', value: 'none'},
    {label: 'Normal', value: 'normal'},
    {label: 'Small', value: 'sm'},
    {label: 'Extra Small', value: 'xs'},
    {label: 'Medium', value: 'md'},
    {label: 'Large', value: 'lg'},
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
        'text-color-mobile'
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

function parseSpecial(prop, attributes) {

    const {'wpbs-layout': settings} = attributes

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
            break;
        case 'height-custom':
            result = {'height': parseSpecial('height', settings?.['height-custom'] ?? settings?.['height'])}

            break;
        case 'min-height':
            break;
        case 'min-height-custom':
            result = {'min-height': parseSpecial('min-height', settings?.['min-height-custom'] ?? settings?.['min-height'])}

            break;
        case 'max-height':
            break;
        case 'max-height-custom':
            result = {'max-height': parseSpecial('max-height', settings?.['max-height-custom'] ?? settings?.['max-height'])}

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
        const breakpoint = WPBS?.settings?.breakpoints[attributes['wpbs-layout']?.breakpoint ?? 'normal'];

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

        if (Object.keys(desktop).length) {
            css += selector + '{';
            Object.entries(desktop).forEach(([prop, value]) => {

                css += [prop, value].join(':') + ';';
            })

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

    const resetAll_layout = () => {
        const result = Object.keys(LAYOUT_PROPS.layout).reduce((o, key) => ({...o, [key]: undefined}), {});
        setSettings(result);
        setAttributes(result);
    };

    const resetAll_mobile = () => {
        const result = Object.keys(LAYOUT_PROPS.mobile).reduce((o, key) => ({...o, [key]: undefined}), {});
        setAttributes(result);
    };

    const updateProp = useCallback((newValue) => {

        const result = {
            ...attributes['wpbs-layout'],
            ...newValue,
        }

        setAttributes({
            'wpbs-layout': result
        });

        setSettings(result);

    }, [setAttributes, setSettings]);

    const MemoMediaControl = React.memo(({label, allowedTypes, prop}) => (
        <BaseControl
            label={label}
            __nextHasNoMarginBottom={true}
        >
            <MediaUploadCheck>
                <MediaUpload
                    title={label}
                    onSelect={(newValue) => updateProp({
                        [prop]: {
                            type: newValue.type,
                            id: newValue.id,
                            url: newValue.url,
                            alt: newValue.alt,
                            sizes: newValue.sizes,
                        }
                    })}
                    allowedTypes={allowedTypes || ['image']}
                    value={settings?.[prop] ?? {}}
                    render={({open}) => {
                        return <PreviewThumbnail
                            image={settings?.[prop] ?? {}}
                            callback={(newValue) => updateProp({
                                [prop]: undefined
                            })}
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

    const MemoSelectControl = React.memo(({label, options, prop}) => (
        <SelectControl
            label={label}
            options={options}
            value={settings?.[prop] ?? ''}
            onChange={(newValue) => updateProp({[prop]: newValue})}
            __next40pxDefaultSize
            __nextHasNoMarginBottom
        />
    ));

    const MemoBorderControl = React.memo(({label, prop}) => (
        <BorderControl
            label={label}
            value={settings?.[prop] ?? {}}
            enableAlpha={true}
            enableStyle={true}
            disableCustomColors={false}
            colors={editorColors}
            withSlider={true}
            onChange={(newValue) => updateProp({[prop]: newValue})}
            __experimentalIsRenderedInSidebar={true}
            __next40pxDefaultSize
        />
    ));

    const MemoBoxControl = React.memo(({label, inputProps, prop, sides}) => (
        <BoxControl
            label={label}
            values={settings?.[prop] ?? {}}
            sides={sides}
            onChange={(newValue) => updateProp({[prop]: newValue})}
            inputProps={inputProps}
            __nextHasNoMarginBottom={true}
        />
    ));

    const MemoNumberControl = React.memo(({label, prop, min}) => (
        <NumberControl
            label={label}
            value={settings?.[prop] ?? ''}
            min={min || 0}
            isDragEnabled={false}
            onChange={(newValue) => updateProp({[prop]: newValue})}
            __next40pxDefaultSize
        />
    ));

    const MemoUnitControl = React.memo(({label, units, prop}) => (
        <UnitControl
            label={label}
            value={settings?.[prop] ?? ''}
            units={units || DIMENSION_UNITS}
            isResetValueOnUnitChange={true}
            onChange={(newValue) => updateProp({[prop]: newValue})}
            __next40pxDefaultSize
        />
    ));

    const MemoRangeControl = React.memo(({label, prop, step, min, max}) => (
        <RangeControl
            label={label}
            step={step}
            withInputField={true}
            allowReset={true}
            isShiftStepEnabled
            initialPosition={0}
            value={settings?.[prop] ?? ''}
            onChange={(newValue) => updateProp({[prop]: newValue})}
            __next40pxDefaultSize
            __nextHasNoMarginBottom
            min={min}
            max={max}
        />
    ));

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
                    prop={'display'}
                    options={DISPLAY_OPTIONS}
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
                    prop={'flex-direction'}
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
                    prop={'container'}
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
                    prop={'align-items'}
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
                    prop={'justify-content'}
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
                    prop={'opacity'}
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
                    prop={'basis'}
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
                    prop={'width'}
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
                    prop={'width-custom'}
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
                    prop={'max-width'}
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
                    prop={'height'}
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
                    prop={'height-custom'}
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
                    prop={'min-height'}
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
                    prop={'min-height-custom'}
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
                    prop={'max-height'}
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
                    prop={'max-height-custom'}
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
                    prop={'flex-wrap'}
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
                    prop={'flex-grow'}
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
                    prop={'flex-shrink'}
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
                    prop={'position'}
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
                    prop={'z-index'}
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
                        prop={'top'}
                    />
                    <MemoUnitControl
                        label="Right"
                        prop={'right'}
                    />
                    <MemoUnitControl
                        label="Bottom"
                        prop={'bottom'}
                    />
                    <MemoUnitControl
                        label="Left"
                        prop={'left'}
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
                    prop={'overflow'}
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
                    prop={'aspect-ratio'}
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
                    prop={'order'}
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
                    prop={'outline-offset'}
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
                    prop={'offset-header'}
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
                    prop={'translate'}
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
                    label={'Outline'}
                    prop={'outline'}
                />
            </ToolsPanelItem>

            <ToolsPanelItem
                hasValue={() => !!settings?.['mask-image']}
                label={'Mask'}
                onDeselect={() => {
                    updateProp({
                        ['mask-image']: {},
                        ['mask-origin']: '',
                        ['mask-size']: ''
                    });
                }}
            >

                <Grid columns={1} columnGap={15} rowGap={20} style={{gridColumn: '1/-1'}}>
                    <MemoMediaControl
                        label={'Mask Image'}
                        prop={'mask-image'}
                        allowedTypes={['image']}
                    />

                    <Grid columns={2} columnGap={15} rowGap={20}>
                        <MemoSelectControl
                            label="Origin"
                            prop={'mask-origin'}
                            options={ORIGIN_OPTIONS}
                        />
                        <MemoSelectControl
                            label="Size"
                            prop={'mask-size'}
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
                    prop={'display-mobile'}
                    options={DISPLAY_OPTIONS}
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
                    prop={'flex-direction-mobile'}
                    options={DIRECTION_OPTIONS}
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
                    prop={'align-items-mobile'}
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
                    prop={'justify-content-mobile'}
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
                    prop={'opacity-mobile'}
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
                    prop={'basis-mobile'}
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
                    prop={'width-mobile'}
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
                    prop={'width-custom-mobile'}
                    units={DIMENSION_UNITS}
                />

            </ToolsPanelItem>
            <ToolsPanelItem
                style={{gridColumn: 'span 1'}}
                hasValue={() => !!attributes['wpbs-layout']?.['max-width-mobile']}
                label={'Max-Width'}
                onDeselect={() => {
                    updateProp({['max-width-mobile']: ''})
                }}
            >
                <MemoUnitControl
                    label="Max-Width"
                    prop={'max-width-mobile'}
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
                    prop={'height-mobile'}
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
                    prop={'height-custom-mobile'}
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
                    prop={'min-height-mobile'}
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
                    prop={'min-height-custom-mobile'}
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
                    prop={'max-height-mobile'}
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
                    prop={'max-height-custom-mobile'}
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
                    prop={'flex-wrap-mobile'}
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
                    prop={'flex-grow-mobile'}
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
                    prop={'flex-shrink-mobile'}
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
                    prop={'position-mobile'}
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
                    prop={'z-index-mobile'}
                    min={-100}
                />
            </ToolsPanelItem>
            <ToolsPanelItem
                hasValue={() => !!settings?.['top-mobile'] || !!settings?.['right-mobile'] || !!settings?.['bottom-mobile'] || !!settings?.['left-mobile']}
                label={'Box Position'}
                onDeselect={() => updateProp({
                    'top-mobile': '',
                    'right-mobile': '',
                    'bottom-mobile': '',
                    'left-mobile': ''
                })}
            >
                <Grid columns={2} columnGap={20} rowGap={20} style={{gridColumnStart: 1, gridColumnEnd: -1}}>

                    <MemoUnitControl
                        label="Top"
                        prop={'top-mobile'}
                    />
                    <MemoUnitControl
                        label="Right"
                        prop={'right-mobile'}
                    />
                    <MemoUnitControl
                        label="Bottom"
                        prop={'bottom-mobile'}
                    />
                    <MemoUnitControl
                        label="Left"
                        prop={'left-mobile'}
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
                    prop={'overflow-mobile'}
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
                    prop={'aspect-ratio-mobile'}
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
                    prop={'order-mobile'}
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
                    prop={'outline-offset-mobile'}
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
                    prop={'offset-header-mobile'}
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
                    prop={'translate-mobile'}
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
                    prop={'outline-mobile'}
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
                        prop={'mask-image-mobile'}
                        allowedTypes={['image']}
                    />

                    <Grid columns={2} columnGap={15} rowGap={20}>
                        <MemoSelectControl
                            label="Origin"
                            prop={'mask-origin-mobile'}
                            options={ORIGIN_OPTIONS}
                        />
                        <MemoSelectControl
                            label="Size"
                            prop={'mask-size-mobile'}
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
                    prop={'breakpoint'}
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
                    prop={'padding-mobile'}
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
                    prop={'margin-mobile'}
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
                    prop={'gap-mobile'}
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
                    prop={'border-radius-mobile'}
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
                    prop={'font-size-mobile'}
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
                    prop={'line-height-mobile'}
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
                    prop={'text-align-mobile'}
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