import {memo, createRoot, useState, useCallback, useMemo, useEffect} from '@wordpress/element';
import {
    __experimentalBoxControl as BoxControl,
    Button,
    GradientPicker,
    Popover
} from '@wordpress/components';
import _ from "lodash";
import {ShadowSelector} from "Components/ShadowSelector";
import {MediaUpload, MediaUploadCheck, PanelColorSettings} from "@wordpress/block-editor";
import PreviewThumbnail from "Components/PreviewThumbnail";
import {
    ALIGN_OPTIONS,
    CONTAINER_OPTIONS, CONTENT_VISIBILITY_OPTIONS, DIMENSION_UNITS,
    DIRECTION_OPTIONS,
    DISPLAY_OPTIONS, HEIGHT_OPTIONS, JUSTIFY_OPTIONS, OVERFLOW_OPTIONS, POSITION_OPTIONS,
    REVEAL_ANIMATION_OPTIONS,
    REVEAL_EASING_OPTIONS, SHAPE_OPTIONS, TEXT_ALIGN_OPTIONS, WIDTH_OPTIONS, WRAP_OPTIONS
} from "Includes/config";

import {getCSSFromStyle, cleanObject, updateSettings} from 'Includes/helper';

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

const DynamicFieldPopover = ({
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

function saveStyle(newStyle = {}, props, styleRef) {
    const {attributes, name, setAttributes} = props;
    const prev = attributes['wpbs-style'] || {};

    const cleanedStyle = cleanObject(newStyle);

    if (_.isEqual(cleanObject(prev), cleanedStyle)) return;

    // Normalize into CSS object
    const cssObj = {
        props: parseSpecialProps(cleanedStyle.props || {}),
        breakpoints: {},
        hover: {},
    };

    if (newStyle.breakpoints) {
        for (const [bpKey, bpProps] of Object.entries(cleanedStyle.breakpoints)) {
            cssObj.breakpoints[bpKey] = parseSpecialProps(bpProps);
        }
    }

    if (newStyle.hover) {
        cssObj.hover = parseSpecialProps(cleanedStyle.hover);
    }

    // Save attributes
    setAttributes({
        'wpbs-style': cleanedStyle,
        'wpbs-css': cleanObject(cssObj),
    });
}


const Field = memo(({field, settings, callback}) => {
    const {type, slug, label, large = false, ...controlProps} = field;
    if (!type || !slug || !label) return null;

    const classNames = [large ? '--full' : null].filter(Boolean).join(' ');
    const value = settings?.[slug];
    const inputId = `wpbs-${slug}`;

    const change = (next) => callback(next);
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
                settings?.[field.slug] !== null
        );
    }, [settings, suppress]);

    return activeFields.map((field) => <Field field={field}
                                              settings={settings}
                                              callback={(newValue) => updateProp({[field.slug]: newValue})}
    />);
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

const openStyleEditor = (mountNode, props, styleRef) => {

    const {attributes} = props;

    const {uniqueId, 'wpbs-css': cssObj} = attributes;

    if (!mountNode || !mountNode.classList.contains('wpbs-style-placeholder')) return;

    // Reuse an existing root if possible
    if (!window.WPBS_StyleControls?.activeRoot) {
        window.WPBS_StyleControls.activeRoot = createRoot(mountNode);
    }

    window.WPBS_StyleControls.activeRoot.render(
        wp.element.createElement(StyleEditorUI, {props, styleRef})
    );
};

function getStyleString(props, styleRef) {

    const {attributes, name} = props;
    const {uniqueId, 'wpbs-css': cssObj} = attributes;

    if (styleRef?.current && uniqueId) {
        const blockClass = name ? `.${name.replace('/', '-')}` : '';
        const selector = `${blockClass}.${uniqueId}`.trim();

        let cssString = '';

        if (!_.isEmpty(cssObj.props)) {
            cssString += `${selector} { ${propsToCss(cssObj.props)} }`;
        }

        for (const [bpKey, bpProps] of Object.entries(cssObj.breakpoints)) {
            const bp = WPBS?.settings?.breakpoints?.[bpKey];
            if (bp && !_.isEmpty(bpProps)) {
                cssString += `@media (max-width: ${bp.size - 1}px) { ${selector} { ${propsToCss(bpProps, true)} } }`;
            }
        }

        if (!_.isEmpty(cssObj.hover)) {
            cssString += `${selector}:hover { ${propsToCss(cssObj.hover)} }`;
        }

        styleRef.current.textContent = cssString.trim();
    }
}

const StyleEditorUI = ({props, styleRef}) => {

    const {attributes} = props;

    // Breakpoints config
    const breakpoints = useMemo(() => {
        const bps = WPBS?.settings?.breakpoints ?? {};
        return Object.entries(bps).map(([key, {label, size}]) => ({key, label, size}));
    }, []);

    const initialLayout = attributes['wpbs-style'] || {
        props: {},
        breakpoints: {},
        hover: {},
    };

    // Local editing state (keeps empty values visible until committed)
    const [localLayout, setLocalLayout] = useState(initialLayout);

    // Sync local state if attributes change from outside
    useEffect(() => {
        setLocalLayout(initialLayout);
    }, [initialLayout]);

    useEffect(() => {
        getStyleString(props, styleRef);
    }, [localLayout]);

    // Commit local state → clean + save to attributes
    const commit = useCallback(
        (next) => {
            setLocalLayout(next);
            saveStyle(next, props, styleRef); // scrub + persist
        },
        [props, styleRef]
    );

    // Update helpers
    const updateDefaultLayout = useCallback(
        (newProps) => {
            commit({
                ...localLayout,
                props: {...localLayout.props, ...newProps},
            });
        },
        [localLayout, commit]
    );

    const updateHoverItem = useCallback(
        (newProps) => {
            commit({
                ...localLayout,
                hover: {...localLayout.hover, ...newProps},
            });
        },
        [localLayout, commit]
    );

    const updateLayoutItem = useCallback(
        (newProps, bpKey) => {
            commit({
                ...localLayout,
                breakpoints: {
                    ...localLayout.breakpoints,
                    [bpKey]: {
                        ...localLayout.breakpoints[bpKey],
                        ...newProps,
                    },
                },
            });
        },
        [localLayout, commit]
    );

    const addLayoutItem = useCallback(() => {
        const keys = Object.keys(localLayout.breakpoints);
        if (keys.length >= 3) return;

        const availableBps = breakpoints
            .map((bp) => bp.key)
            .filter((bp) => !keys.includes(bp));
        if (!availableBps.length) return;

        const newKey = availableBps[0];
        commit({
            ...localLayout,
            breakpoints: {
                ...localLayout.breakpoints,
                [newKey]: {},
            },
        });
    }, [localLayout, breakpoints, commit]);

    const removeLayoutItem = useCallback(
        (bpKey) => {
            const {[bpKey]: removed, ...rest} = localLayout.breakpoints;
            commit({...localLayout, breakpoints: rest});
        },
        [localLayout, commit]
    );

    // Sorted list of breakpoints
    const layoutKeys = useMemo(() => {
        const keys = Object.keys(localLayout.breakpoints || {});
        return keys.sort((a, b) => {
            const bpA = breakpoints.find((bp) => bp.key === a);
            const bpB = breakpoints.find((bp) => bp.key === b);
            return (bpA?.size || 0) - (bpB?.size || 0);
        });
    }, [localLayout.breakpoints, breakpoints]);

    return (
        <div className="wpbs-layout-tools__container">
            {/* Default */}
            <section className="wpbs-layout-tools__panel active">
                <div className="wpbs-layout-tools__header">
                    <strong>Default</strong>
                    <DynamicFieldPopover
                        currentSettings={localLayout.props}
                        fieldsMap={layoutFieldsMap}
                        onAdd={(slug) => updateDefaultLayout({[slug]: ''})}
                        onClear={(slug) => {
                            const next = {...localLayout.props};
                            delete next[slug];
                            updateDefaultLayout(next);
                        }}
                    />
                </div>
                <div className="wpbs-layout-tools__grid">
                    <LayoutFields
                        bpKey="layout"
                        settings={localLayout.props}
                        updateLayoutItem={updateDefaultLayout}
                        suppress={['padding', 'margin', 'gap']}
                    />
                </div>
            </section>

            {/* Hover */}
            <section className="wpbs-layout-tools__panel active">
                <div className="wpbs-layout-tools__header">
                    <strong>Hover</strong>
                    <DynamicFieldPopover
                        currentSettings={localLayout.hover}
                        fieldsMap={hoverFieldsMap}
                        onAdd={(slug) => updateHoverItem({[slug]: ''})}
                        onClear={(slug) => {
                            const next = {...localLayout.hover};
                            delete next[slug];
                            updateHoverItem(next);
                        }}
                    />
                </div>
                <div className="wpbs-layout-tools__grid">
                    <HoverFields
                        hoverSettings={localLayout.hover}
                        updateHoverItem={updateHoverItem}
                    />
                </div>
            </section>

            {/* Breakpoints */}
            {layoutKeys.map((bpKey) => {
                const bp = breakpoints.find((b) => b.key === bpKey);
                const size = bp?.size ? `(${bp.size}px)` : '';
                const panelLabel = [bp ? bp.label : bpKey, size].filter(Boolean).join(' ');

                return (
                    <section key={bpKey} className="wpbs-layout-tools__panel active">
                        <div className="wpbs-layout-tools__header">
                            <Button
                                isSmall
                                size="small"
                                iconSize={20}
                                onClick={() => removeLayoutItem(bpKey)}
                                icon="no-alt"
                            />
                            <strong>{panelLabel}</strong>
                            <DynamicFieldPopover
                                currentSettings={localLayout.breakpoints[bpKey]}
                                fieldsMap={layoutFieldsMap}
                                onAdd={(slug) => updateLayoutItem({[slug]: ''}, bpKey)}
                                onClear={(slug) => {
                                    const next = {...localLayout.breakpoints[bpKey]};
                                    delete next[slug];
                                    updateLayoutItem(next, bpKey);
                                }}
                            />
                        </div>
                        <div className="wpbs-layout-tools__grid">
                            <label className="wpbs-layout-tools__field --full">
                                <strong>Breakpoint</strong>
                                <div className="wpbs-layout-tools__control">
                                    <select
                                        value={bpKey}
                                        onChange={(e) => {
                                            const newBpKey = e.target.value;
                                            const newBreakpoints = {...localLayout.breakpoints};
                                            newBreakpoints[newBpKey] = newBreakpoints[bpKey];
                                            delete newBreakpoints[bpKey];
                                            commit({...localLayout, breakpoints: newBreakpoints});
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
                                settings={localLayout.breakpoints[bpKey]}
                                updateLayoutItem={(newProps) => updateLayoutItem(newProps, bpKey)}
                            />
                        </div>
                    </section>
                );
            })}

            <Button
                variant="primary"
                onClick={addLayoutItem}
                style={{
                    borderRadius: '4px',
                    width: '100%',
                    textAlign: 'center',
                    gridColumn: '1/-1',
                }}
                disabled={layoutKeys.length >= 3}
            >
                Add Breakpoint
            </Button>
        </div>
    );
};

export default class WPBS_StyleControls {
    constructor() {
        this.openStyleEditor = openStyleEditor;

        if (window.WPBS_StyleControls) {
            console.warn('WPBS.StyleControls already defined, skipping reinit.');
            return window.WPBS_StyleControls;
        }

        this.init();
    }

    init() {
        if (!window.WPBS_StyleControls) {
            window.WPBS_StyleControls = {};
        }

        window.WPBS_StyleControls = this;
        return window.WPBS_StyleControls;
    }
}



