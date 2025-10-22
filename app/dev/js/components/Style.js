import React, {memo, useCallback, useEffect, useMemo, useState} from "react";
import {
    __experimentalBoxControl as BoxControl,
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
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
    ToggleControl,
    Popover
} from "@wordpress/components";
import {InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings,} from "@wordpress/block-editor";
import {
    ALIGN_OPTIONS,
    BLEND_OPTIONS,
    CONTAINER_OPTIONS,
    CONTENT_VISIBILITY_OPTIONS,
    DIMENSION_UNITS,
    DIRECTION_OPTIONS,
    DISPLAY_OPTIONS,
    HEIGHT_OPTIONS,
    IMAGE_SIZE_OPTIONS,
    JUSTIFY_OPTIONS,
    OBJECT_POSITION_OPTIONS,
    ORIGIN_OPTIONS,
    OVERFLOW_OPTIONS,
    POSITION_OPTIONS,
    REPEAT_OPTIONS,
    RESOLUTION_OPTIONS,
    REVEAL_ANIMATION_OPTIONS,
    REVEAL_EASING_OPTIONS,
    SHAPE_OPTIONS,
    TEXT_ALIGN_OPTIONS,
    WIDTH_OPTIONS,
    WRAP_OPTIONS,
} from "Includes/config";
import {useInstanceId} from "@wordpress/compose";
import _ from 'lodash';
import PreviewThumbnail from "Components/PreviewThumbnail";
import {ShadowSelector} from "Components/ShadowSelector";


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

function propsToCss(props = {}, important = false, importantKeysCustom = []) {
    const importantProps = [
        'padding', 'margin', 'gap',
        'width', 'min-width', 'max-width', 'height', 'min-height', 'max-height',
        'color', 'background-color', 'border-color',
        'font-size', 'line-height', 'letter-spacing',
        'border-width', 'border-radius',
        'opacity', 'box-shadow', 'filter',
        ...importantKeysCustom
    ];

    return Object.entries(props)
        .filter(([_, v]) => v !== null && v !== '') // move filter before map
        .map(([k, v]) => {
            const needsImportant = important && importantProps.some(sub => k.includes(sub));
            return `${k}: ${v}${needsImportant ? ' !important' : ''};`;
        })
        .join(' ');
}

export function useUniqueId({name, attributes}) {

    const {uniqueId} = attributes;
    const prefix = (name ?? 'wpbs-block').replace(/[^a-z0-9]/gi, '-');
    //return uniqueId || instanceId;
    return useInstanceId(useUniqueId, prefix);
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

const heightVal = (val) => {

    let height = val;

    if (val === 'screen') {
        height = 'calc(100svh - var(--wpbs-header-height, 0px))'
    }

    if (val === 'full-screen') {
        height = '100svh'
    }

    if (['auto', 'full', 'inherit'].includes(val)) {
        height = val;
    }

    return height;

}

function parseSpecialProps(props = {}, attributes = {}) {
    const result = {};

    Object.entries(props).forEach(([key, val]) => {
        if (val == null) return;

        if (SPECIAL_FIELDS.includes(key)) {
            switch (key) {
                case 'margin':
                case 'padding':
                case 'gap':
                    if (typeof val === 'object') {
                        if (val.top) result[`${key}-top`] = val.top;
                        if (val.right) result[`${key}-right`] = val.right;
                        if (val.bottom) result[`${key}-bottom`] = val.bottom;
                        if (val.left) result[`${key}-left`] = val.left;
                    }
                    break;

                case 'height':
                case 'height-custom': {
                    result['height'] = props?.['height-custom'] ?? props?.['height'] ?? val;
                    switch (result['height']) {
                        case 'screen':
                            result['height'] = '100svh';
                    }
                    break;
                }

                case 'min-height':
                case 'min-height-custom':
                    result['min-height'] = heightVal(props?.['min-height-custom'] ?? props?.['min-height'] ?? val);
                    break;

                case 'max-height':
                case 'max-height-custom':
                    result['max-height'] = heightVal(props?.['max-height-custom'] ?? props?.['max-height'] ?? val);
                    break;

                case 'width':
                case 'width-custom':
                    result['width'] = props?.['width-custom'] ?? props?.['width'] ?? val;
                    break;

                case 'mask-image': {
                    const imageUrl = val?.sizes?.full?.url;
                    result['mask-image'] = imageUrl ? `url(${imageUrl})` : 'none';
                    result['mask-repeat'] = 'no-repeat';
                    result['mask-size'] = (() => {
                        switch (props?.['mask-size']) {
                            case 'cover':
                                return 'cover';
                            case 'horizontal':
                                return '100% auto';
                            case 'vertical':
                                return 'auto 100%';
                            default:
                                return 'contain';
                        }
                    })();
                    result['mask-position'] = props?.['mask-origin'] || 'center center';
                    break;
                }

                case 'border': {
                    if (typeof val === 'object') {
                        if (val.top) {
                            result['border-top'] = Object.values({style: 'solid', ...val.top}).join(' ');
                        }
                        if (val.right) {
                            result['border-right'] = Object.values({style: 'solid', ...val.right}).join(' ');
                        }
                        if (val.bottom) {
                            result['border-bottom'] = Object.values({style: 'solid', ...val.bottom}).join(' ');
                        }
                        if (val.left) {
                            result['border-left'] = Object.values({style: 'solid', ...val.left}).join(' ');
                        }
                    }
                    break;
                }

                case 'border-radius': {
                    if (typeof val === 'object') {
                        if (val.topLeft) result['border-top-left-radius'] = val.topLeft;
                        if (val.topRight) result['border-top-right-radius'] = val.topRight;
                        if (val.bottomRight) result['border-bottom-right-radius'] = val.bottomRight;
                        if (val.bottomLeft) result['border-bottom-left-radius'] = val.bottomLeft;
                    }
                    break;
                }


                case 'outline': {
                    if (typeof val === 'object') {
                        if (val.top) {
                            result['outline-top'] = Object.values({style: 'solid', ...val.top}).join(' ');
                        }
                        if (val.right) {
                            result['outline-right'] = Object.values({style: 'solid', ...val.right}).join(' ');
                        }
                        if (val.bottom) {
                            result['outline-bottom'] = Object.values({style: 'solid', ...val.bottom}).join(' ');
                        }
                        if (val.left) {
                            result['outline-left'] = Object.values({style: 'solid', ...val.left}).join(' ');
                        }
                    }
                    break;
                }

                case 'transition': {
                    const transitions = Array.isArray(val) ? [...val] : [val];
                    if (transitions.includes('color') && !transitions.includes('text-decoration-color')) {
                        transitions.push('text-decoration-color');
                    }
                    result['transition-property'] = transitions.join(', ');
                    break;
                }

                case 'duration':
                    result['transition-duration'] = val;
                    break;

                case 'text-color':
                    result['color'] = val;
                    break;

                case 'text-decoration-color':
                    result['text-decoration-color'] = `${val} !important`;
                    result['text-underline-offset'] = '.3em';
                    break;

                case 'translate':
                    result['transform'] = `translate(${
                        getCSSFromStyle(val?.left || '0px')
                    }, ${
                        getCSSFromStyle(val?.top || '0px')
                    })`;
                    break;

                case 'offset-header':
                    result['padding-top'] = `calc(${getCSSFromStyle(attributes?.style?.spacing?.padding?.top || '0px')} + var(--wpbs-header-height, 0px)) !important`;
                    break;

                case 'align-header':
                    result['top'] = 'var(--wpbs-header-height, auto)';
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

export const Style = ({attributes, name, uniqueId}) => {

    if (!uniqueId) return null;

    const cssString = useMemo(() => {
        if (!attributes['wpbs-css']?.props && !attributes['wpbs-css']?.breakpoints) return '';

        const selector = `.wp-block-${name.replace('/', '-')}` + `.${uniqueId}`;

        const {'wpbs-css': parsedCss = {}} = attributes;

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

                result += `@media (max-width: ${bp.size - 1}px) { ${selector} { ${propsToCss(bpProps, true)} } }`;
            });
        }

        // 3. Hover
        if (!_.isEmpty(parsedCss.hover)) {
            result += `${selector}:hover { ${propsToCss(parsedCss.hover)} }`;
        }

        return result;
    }, [attributes['wpbs-css'], name, uniqueId]);

    const cssBackgroundString = useMemo(() => {
        if (!attributes['wpbs-css']?.background) return '';

        const selector = `.wp-block-${name.replace('/', '-')}` + `.${uniqueId} > .wpbs-background`;

        const {background: parsedCss = {}} = attributes?.['wpbs-css'] ?? {};

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

const DynamicFieldPopover = ({
                                 title = 'Add',
                                 currentSettings,
                                 fieldsMap = layoutFieldsMap,
                                 onAdd,
                                 onClear,
                             }) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);
    const close = () => setIsOpen(false);

    const list = useMemo(() => {
        return fieldsMap.map((f) => {
            const isActive = currentSettings?.[f.slug] !== undefined && currentSettings?.[f.slug] !== null;
            return {...f, isActive};
        });
    }, [fieldsMap, currentSettings]);

    return (
        <div className="wpbs-layout-tools__popover-wrapper">
            <Button
                size="small"
                icon="plus-alt2"
                iconSize={15}
                onClick={toggle}
                aria-expanded={isOpen}
                className="wpbs-layout-tools__toggle"
            />

            {isOpen && (
                <Popover
                    placement="bottom-start"
                    onFocusOutside={close}
                    className="wpbs-layout-tools__popover"
                >
                    <ul className="wpbs-layout-tools__popover-list">
                        {list.map((f) => (
                            <li
                                key={f.slug}
                                className={`wpbs-layout-tools__popover-item ${f.isActive ? 'active' : ''}`}
                            >
                                <Button
                                    variant="link"
                                    onClick={() => {
                                        if (f.isActive) {
                                            // Clear the field
                                            onClear
                                                ? onClear(f.slug)
                                                : onAdd(f.slug, true); // fallback clears too
                                        } else {
                                            onAdd(f.slug);
                                        }
                                        close();
                                    }}
                                >
                                    <span>{f.label}</span>
                                </Button>
                            </li>
                        ))}
                    </ul>
                </Popover>
            )}
        </div>
    );
};


function Layout({attributes = {}, layoutSettings = {}, setLayoutSettings}) {

    const [activePopover, setActivePopover] = useState(null);
    const togglePopover = (key) => setActivePopover(activePopover === key ? null : key);
    const closePopover = () => setActivePopover(null);

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

    console.log(layoutKeys);


    return (
        <PanelBody title={'Layout'} initialOpen={false} className={'wpbs-layout-tools'}>
            <div className={'wpbs-layout-tools__container'}>

                {/* Default */}
                <section className={'wpbs-layout-tools__panel active'}>
                    <div className="wpbs-layout-tools__header">
                        <strong>Default</strong>
                        <DynamicFieldPopover
                            currentSettings={layoutObj.props}
                            fieldsMap={layoutFieldsMap}
                            onAdd={(slug) => updateDefaultLayout({[slug]: ''})}
                            onClear={(slug) => {
                                const next = {...layoutObj.props};
                                delete next[slug];
                                updateDefaultLayout(next);
                            }}
                        />


                    </div>
                    <div className={'wpbs-layout-tools__grid'}>
                        <LayoutFields
                            bpKey="layout"
                            settings={layoutObj.props}
                            updateLayoutItem={updateDefaultLayout}
                            suppress={['padding', 'margin', 'gap']}
                        />
                    </div>
                </section>

                {/* Hover */}
                <section className={'wpbs-layout-tools__panel active'}>
                    <div className="wpbs-layout-tools__header">
                        <strong>Hover</strong>
                        <DynamicFieldPopover
                            currentSettings={layoutObj.hover}
                            fieldsMap={hoverFieldsMap}
                            onAdd={(slug) => updateHoverItem({[slug]: ''})}
                            onClear={(slug) => {
                                const next = {...layoutObj.hover};
                                delete next[slug];
                                updateHoverItem(next);
                            }}
                        />
                    </div>
                    <div className={'wpbs-layout-tools__grid'}>
                        <HoverFields hoverSettings={layoutObj.hover} updateHoverItem={updateHoverItem}/>
                    </div>
                </section>

                {/* Breakpoints */}
                {layoutKeys.map((bpKey) => {
                    const bp = breakpoints.find((b) => b.key === bpKey);
                    const size = bp?.size ? `(${bp.size}px)` : '';
                    const panelLabel = [bp ? bp.label : bpKey, size].filter(Boolean).join(' ');

                    return (
                        <section key={bpKey} className={'wpbs-layout-tools__panel active'}>

                            <div className="wpbs-layout-tools__header">
                                <Button isSmall={true} size={'small'} iconSize={20}
                                        onClick={() => removeLayoutItem(bpKey)}
                                        icon={'no-alt'}/>
                                <strong>{panelLabel}</strong>
                                <DynamicFieldPopover
                                    currentSettings={layoutObj.breakpoints[bpKey]}
                                    fieldsMap={layoutFieldsMap}
                                    onAdd={(slug) => updateLayoutItem({[slug]: ''}, bpKey)}
                                    onClear={(slug) => {
                                        const next = {...layoutObj.breakpoints[bpKey]};
                                        delete next[slug];
                                        updateLayoutItem(next, bpKey);
                                    }}
                                />

                            </div>
                            <div className={'wpbs-layout-tools__grid'}>
                                <label className={'wpbs-layout-tools__field --full'}>
                                    <strong>Breakpoint</strong>
                                    <div className={'wpbs-layout-tools__control'}>
                                        <select
                                            value={bpKey}
                                            onChange={(e) => {
                                                const newBpKey = e.target.value;
                                                const newBreakpoints = {...layoutObj.breakpoints};
                                                newBreakpoints[newBpKey] = newBreakpoints[bpKey];
                                                delete newBreakpoints[bpKey];
                                                setLayoutObj({...layoutObj, breakpoints: newBreakpoints});
                                            }}
                                        >
                                            {breakpoints.map((b) => (
                                                <option
                                                    key={b.key}
                                                    value={b.key}
                                                    disabled={b.key !== bpKey && layoutKeys.includes(b.key)}
                                                >
                                                    {b.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </label>

                                <LayoutFields
                                    bpKey={bpKey}
                                    settings={layoutObj.breakpoints[bpKey]}
                                    updateLayoutItem={updateLayoutItem}
                                />
                            </div>
                        </section>
                    );
                })}

                <Button variant="primary" onClick={addLayoutItem}
                        style={{borderRadius: '0', width: '100%', gridColumn: '1/-1'}}
                        disabled={layoutKeys.length >= 3}>
                    Add Breakpoint
                </Button>
            </div>
        </PanelBody>
    );

}

const Field = memo(({field, settings, callback}) => {
    const {type, slug, label, large = false, ...controlProps} = field;
    if (!type || !slug || !label) return null;

    const classNames = [large ? '--full' : null].filter(Boolean).join(' ');
    const value = settings?.[slug];
    const inputId = `wpbs-${slug}`;

    const change = (next) => callback({[slug]: next});
    const onInput = (e) => change(e.target.value);

    let control = null;

    switch (type) {
        // ————— simple, native controls —————
        case 'select': {
            const opts = controlProps?.options || [];
            control = (
                <label className={`wpbs-layout-tools__field ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --select">
                        <select value={value ?? ''} onChange={onInput} id={inputId}>
                            {opts.map((o) => (
                                <option key={o.value} value={o.value} disabled={o.disabled}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </label>
            );
            break;
        }

        case 'text':
            control = (
                <label className={`wpbs-layout-tools__field ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --text">
                        <input
                            type="text"
                            value={value ?? ''}
                            onChange={onInput}
                        />
                    </div>
                </label>
            );
            break;

        case 'number':
            control = (
                <label className={`wpbs-layout-tools__field ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --number">
                        <input
                            type="number"
                            value={value ?? ''}
                            onChange={(e) => {
                                const v = e.target.value;
                                change(v === '' ? '' : Number.isNaN(Number(v)) ? '' : Number(v));
                            }}
                            {...controlProps}
                        />
                    </div>
                </label>
            );
            break;

        case 'toggle':
            control = (
                <label className={`wpbs-layout-tools__field --toggle ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --toggle">
                        <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) => change(e.target.checked)}
                        />
                    </div>
                </label>
            );
            break;

        case 'range':
            control = (
                <label className={`wpbs-layout-tools__field ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --range">
                        <input
                            type="range"
                            value={
                                typeof value === 'number'
                                    ? value
                                    : controlProps.min ?? 0
                            }
                            min={controlProps.min ?? 0}
                            max={controlProps.max ?? 100}
                            step={controlProps.step ?? 1}
                            onChange={(e) => change(Number(e.target.value))}
                        />
                    </div>
                </label>
            );
            break;

        case 'unit':
            control = (
                <label className={`wpbs-layout-tools__field ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --unit">
                        <input
                            type="text"
                            value={value ?? ''}
                            onChange={onInput}
                            placeholder="e.g. 12px, 2rem, 50%"
                        />
                    </div>
                </label>
            );
            break;

        // ————— composite (recursive) —————
        case 'composite':
            control = (
                <div className={`wpbs-layout-tools__field --composite ${classNames}`}>
                    <div className="wpbs-layout-tools__label">{label}</div>
                    <div className="wpbs-layout-tools__group">
                        {field.fields.map((sub) => (
                            <Field
                                key={sub.slug}
                                field={sub}
                                settings={settings}
                                callback={callback}
                            />
                        ))}
                    </div>
                </div>
            );
            break;

        // ————— keep heavyweight WP bits for now —————
        case 'shadow':
            control = (
                <div className={`wpbs-layout-tools__field ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --shadow">
                        <ShadowSelector
                            label={label}
                            value={value}
                            onChange={(val) => change(val)}
                        />
                    </div>
                </div>
            );
            break;

        case 'color':
            control = (
                <div className={`wpbs-layout-tools__field ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --color">
                        <PanelColorSettings
                            enableAlpha
                            colorSettings={[
                                {
                                    slug,
                                    label,
                                    value,
                                    onChange: (val) => change(val),
                                    isShownByDefault: true,
                                },
                            ]}
                        />
                    </div>
                </div>
            );
            break;

        case 'gradient':
            control = (
                <div className={`wpbs-layout-tools__field ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --gradient">
                        <GradientPicker
                            {...{
                                key: slug,
                                gradients: controlProps.gradients || [],
                                clearable: true,
                                value: value ?? field?.default ?? '',
                                onChange: (val) => change(val),
                            }}
                        />
                    </div>
                </div>
            );
            break;

        case 'box':
            control = (
                <div className={`wpbs-layout-tools__field ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --box">
                        <BoxControl
                            label={label}
                            values={value}
                            onChange={(val) => change(val)}
                            {...controlProps}
                        />
                    </div>
                </div>
            );
            break;

        case 'image':
        case 'video': {
            const allowedTypes = type === 'image' ? ['image'] : ['video'];
            const clear = () => change('');
            control = (
                <div className={`wpbs-layout-tools__field ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --media">
                        <MediaUploadCheck>
                            <MediaUpload
                                title={label}
                                onSelect={(val) => change(val)}
                                allowedTypes={allowedTypes}
                                value={value}
                                render={({open}) => (
                                    <PreviewThumbnail
                                        image={{...value, type: settings?.type}}
                                        callback={clear}
                                        style={{objectFit: 'contain'}}
                                        onClick={open}
                                    />
                                )}
                            />
                        </MediaUploadCheck>
                    </div>
                </div>
            );
            break;
        }

        default:
            control = null;
    }

    return control;
});

const layoutFieldsMap = [

    {type: 'select', slug: 'container', label: 'Container', options: CONTAINER_OPTIONS},


    // Reveal / animation
    {
        type: 'composite',
        slug: 'reveal-group',
        label: 'Reveal',
        fields: [
            {type: 'select', slug: 'reveal-anim', label: 'Animation', large: true, options: REVEAL_ANIMATION_OPTIONS},
            {type: 'select', slug: 'reveal-easing', label: 'Easing', options: REVEAL_EASING_OPTIONS},
            {type: 'number', slug: 'reveal-duration', label: 'Duration'},
            {type: 'unit', slug: 'reveal-offset', label: 'Offset'},
            {type: 'unit', slug: 'reveal-distance', label: 'Distance'},
            {type: 'toggle', slug: 'reveal-repeat', label: 'Repeat'},
            {type: 'toggle', slug: 'reveal-mirror', label: 'Mirror'},
        ],
        large: true
    },


    // Header alignment
    {type: 'unit', slug: 'offset-header', label: 'Offset Header'},
    {type: 'toggle', slug: 'align-header', label: 'Align Header'},

    // Display / flex
    {type: 'select', slug: 'display', label: 'Display', options: DISPLAY_OPTIONS},
    {type: 'select', slug: 'flex-direction', label: 'Flex Direction', options: DIRECTION_OPTIONS},
    {type: 'select', slug: 'flex-wrap', label: 'Flex Wrap', options: WRAP_OPTIONS},
    {type: 'select', slug: 'align-items', label: 'Align Items', options: ALIGN_OPTIONS},
    {type: 'select', slug: 'justify-content', label: 'Justify Content', options: JUSTIFY_OPTIONS},

    // Sizing
    {type: 'select', slug: 'aspect-ratio', label: 'Aspect Ratio', options: SHAPE_OPTIONS},
    {type: 'unit', slug: 'opacity', label: 'Opacity'},
    {type: 'unit', slug: 'basis', label: 'Flex Basis'},
    {type: 'select', slug: 'width', label: 'Width', options: WIDTH_OPTIONS},
    {type: 'unit', slug: 'width-custom', label: 'Custom Width'},
    {type: 'unit', slug: 'max-width', label: 'Max Width'},
    {type: 'select', slug: 'height', label: 'Height', options: HEIGHT_OPTIONS},
    {type: 'unit', slug: 'height-custom', label: 'Custom Height'},
    {type: 'unit', slug: 'min-height', label: 'Min Height'},
    {type: 'unit', slug: 'min-height-custom', label: 'Custom Min Height'},
    {type: 'unit', slug: 'max-height', label: 'Max Height'},
    {type: 'unit', slug: 'max-height-custom', label: 'Custom Max Height'},
    {type: 'unit', slug: 'offset-height', label: 'Offset Height'},

    {type: 'unit', slug: 'flex-grow', label: 'Flex Grow'},
    {type: 'unit', slug: 'flex-shrink', label: 'Flex Shrink'},

    // Positioning
    {type: 'select', slug: 'position', label: 'Position', options: POSITION_OPTIONS},
    {type: 'number', slug: 'z-index', label: 'Z Index'},
    {
        type: 'composite',
        slug: 'box-position',
        label: 'Box Position',
        fields: [
            {type: 'unit', slug: 'top', label: 'Top'},
            {type: 'unit', slug: 'right', label: 'Right'},
            {type: 'unit', slug: 'bottom', label: 'Bottom'},
            {type: 'unit', slug: 'left', label: 'Left'},
        ],
        large: true
    },

    // Overflow
    {type: 'select', slug: 'overflow', label: 'Overflow', options: OVERFLOW_OPTIONS},
    {type: 'unit', slug: 'aspect-ratio', label: 'Aspect Ratio'},
    {type: 'unit', slug: 'order', label: 'Order'},
    {
        type: 'box',
        slug: 'translate',
        label: 'Translate',
        options: {sides: ['top', 'left'], inputProps: {units: DIMENSION_UNITS}}
    },

    // Misc toggles
    {type: 'toggle', slug: 'outline', label: 'Outline'},
    {type: 'toggle', slug: 'mark-empty', label: 'Mark Empty'},

    // Colors / visibility
    {type: 'color', slug: 'text-decoration-color', label: 'Text Decoration Color'},
    {type: 'select', slug: 'content-visibility', label: 'Content Visibility', options: CONTENT_VISIBILITY_OPTIONS},

    {
        type: 'box', slug: 'padding', label: 'Padding', large: true,
        options: {sides: ['top', 'right', 'bottom', 'left'], inputProps: {units: DIMENSION_UNITS}}
    },
    {
        type: 'box', slug: 'margin', label: 'Margin', large: true,
        options: {sides: ['top', 'right', 'bottom', 'left'], inputProps: {units: DIMENSION_UNITS}}
    },

    {type: 'unit', slug: 'gap', label: 'Gap'},
    {type: 'unit', slug: 'border-radius', label: 'Border Radius'},
    {type: 'unit', slug: 'font-size', label: 'Font Size'},
    {type: 'unit', slug: 'line-height', label: 'Line Height'},
    {type: 'select', slug: 'text-align', label: 'Text Align', options: TEXT_ALIGN_OPTIONS},

    {type: 'color', slug: 'text-color', label: 'Text Color'},
    {type: 'color', slug: 'background-color', label: 'Background Color'},
    {type: 'text', slug: 'box-shadow', label: 'Shadow'},
];

const hoverFieldsMap = [
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

const LayoutFields = memo(function LayoutFields({bpKey, settings, updateLayoutItem, suppress = []}) {
    const updateProp = useCallback(
        (newProps) => updateLayoutItem(newProps, bpKey),
        [updateLayoutItem, bpKey]
    );

    const activeFields = useMemo(() => {
        return layoutFieldsMap.filter(
            (field) =>
                !suppress.includes(field.slug) &&
                settings?.[field.slug] !== undefined &&
                settings?.[field.slug] !== null &&
                settings?.[field.slug] !== ''
        );
    }, [settings, suppress]);

    return activeFields.map((field) => <Field field={field}
                                              settings={settings}
                                              callback={(newValue) => updateProp({[field.slug]: newValue})}/>);
});

const HoverFields = memo(function HoverFields({hoverSettings, updateHoverItem, suppress = []}) {
    const updateProp = useCallback(
        (newProps) => updateHoverItem(newProps),
        [updateHoverItem]
    );


    return hoverFieldsMap.filter((field) => !suppress.includes(field.slug)).map((field) => {
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
    if (settings['fade']) props['--fade'] = settings['fade'];
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
    if (settings['fade-mobile']) bpProps['--fade'] = settings['fade-mobile'];
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
            type: 'gradient',
            label: 'Fade',
            slug: 'fade',
            large: true,
            disableCustomGradients: false,
            gradients: [],
            default: 'linear-gradient(180deg,rgba(0,0,0,1) 0%,rgba(0,0,0,0) 100%)',
            clearable: true,
            allowCustomColors: false,
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
            default: 'linear-gradient(180deg,rgba(0,0,0,.6) 0%,rgba(0,0,0,.6) 100%)',
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

                                    return <Field
                                        key={slug} // key MUST be stable across renders
                                        toolspanel={false}
                                        field={{...field, slug}} // create new object instead of mutating
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

const styleClassNames = (props) => {
    const {attributes} = props;
    const {'wpbs-style': settings = {}} = attributes ?? {};
    const {layout, background, hover} = settings;

    return [
        attributes?.uniqueId,
        layout?.['offset-height'] ? '--offset-height' : null,
        layout?.['hide-empty'] ? '--hide-empty' : null,
        layout?.['box-shadow'] ? '--shadow' : null,
        layout?.['required'] ? '--required' : null,
        layout?.['offset-header'] ? '--offset-header' : null,
        layout?.['container'] ? '--container' : null,
        layout?.['reveal'] ? '--reveal' : null,
        layout?.['transition'] ? '--transition' : null,
        layout?.['content-visibility'] ? '--content-visibility' : null,
        layout?.['mask-image'] ? '--mask' : null,
    ].filter(Boolean).join(' ');
};

export function withStyle(EditComponent) {
    return (props) => {
        const {attributes, setAttributes, name, isSelected} = props;
        const {
            'wpbs-style': settings = {},
            'wpbs-css': existingCss = {},
            uniqueId: attrId,
        } = attributes;

        const uniqueId = useUniqueId({name, attributes});

        // --- Local UI State ---
        const [layoutSettings, setLayoutSettings] = useState(settings?.layout ?? {});
        const [backgroundSettings, setBackgroundSettings] = useState(settings?.background ?? {});

        // --- Initialize state once from attributes (not on every change) ---
        useEffect(() => {
            setLayoutSettings(settings?.layout ?? {});
            setBackgroundSettings(settings?.background ?? {});
        }, []); // run once on mount

        // --- Compute merged CSS object ---
        const mergedCss = useMemo(() => {
            const layoutCss = parseLayoutCSS(layoutSettings);
            const backgroundCss = parseBackgroundCSS(backgroundSettings);
            return cleanObject(_.merge({}, layoutCss, {background: backgroundCss}));
        }, [layoutSettings, backgroundSettings]);

        // --- Push updates to block attributes when local state changes ---
        useEffect(() => {
            const newStyle = cleanObject({
                layout: layoutSettings,
                background: backgroundSettings,
            });

            const needsStyleUpdate = !_.isEqual(settings, newStyle);
            const needsCssUpdate = !_.isEqual(existingCss, mergedCss);
            const needsIdUpdate = !attrId;

            if (needsStyleUpdate || needsCssUpdate || needsIdUpdate) {
                setAttributes({
                    ...(needsStyleUpdate ? {'wpbs-style': newStyle} : {}),
                    ...(needsCssUpdate ? {'wpbs-css': mergedCss} : {}),
                    ...(needsIdUpdate ? {uniqueId} : {}),
                });
            }
        }, [
            layoutSettings,
            backgroundSettings,
            mergedCss,
            uniqueId,
            attrId,
            settings,
            existingCss,
            setAttributes,
        ]);

        // --- Optional runtime style flags ---
        const [style, setStyle] = useState({});
        const {background = false} = style;

        return (
            <>
                <EditComponent
                    {...props}
                    setStyle={setStyle}
                    style={style}
                    styleClassNames={styleClassNames(props)}
                />

                {isSelected && (
                    <InspectorControls group="styles">
                        <Layout
                            {...props}
                            layoutSettings={layoutSettings}
                            setLayoutSettings={setLayoutSettings}
                        />
                        {background && (
                            <BackgroundFields
                                {...props}
                                backgroundSettings={backgroundSettings}
                                setBackgroundSettings={setBackgroundSettings}
                            />
                        )}
                    </InspectorControls>
                )}

                <Style {...props} uniqueId={uniqueId}/>
            </>
        );
    };
}

export function withStyleSave(SaveElement) {
    return (props) => {
        const {attributes} = props;
        const {uniqueId} = attributes ?? {};

        // Defensive default for classnames
        const baseClasses = [uniqueId, styleClassNames(props)]
            .filter(Boolean)
            .join(' ');

        // Merge helper for blocks that supply their own className
        const mergeClassNames = (localClassName = '') => {
            return [localClassName, baseClasses].filter(Boolean).join(' ');
        };

        // Render the wrapped save element with merged classes
        return (
            <SaveElement
                {...props}
                styleClassNames={mergeClassNames}
            />
        );
    };
}

