import _ from "lodash";

export function cleanObject(obj) {
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

export function saveStyle(newStyle = {}, props, updateStyleSettings) {
    const {attributes} = props;
    const prev = attributes['wpbs-style'] || {};

    const cleanedStyle = cleanObject(newStyle);

    if (_.isEqual(cleanObject(prev), cleanedStyle)) return;

    // Normalize into CSS object
    const cssObj = {
        props: parseSpecialProps(cleanedStyle.props || {}),
        breakpoints: {},
        hover: {},
    };

    if (cleanedStyle.breakpoints) {
        for (const [bpKey, bpProps] of Object.entries(cleanedStyle.breakpoints)) {
            cssObj.breakpoints[bpKey] = parseSpecialProps(bpProps);
        }
    }

    if (newStyle.hover) {
        cssObj.hover = parseSpecialProps(cleanedStyle.hover);
    }

    return {
        'wpbs-style': cleanedStyle,
        'wpbs-css': cleanObject(cssObj),
    };

}

export function propsToCss(props = {}, important = false, importantKeysCustom = []) {
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
        .filter(([_, v]) => v !== null && v !== '')
        .map(([k, v]) => {
            const needsImportant = important && importantProps.some(sub => k.includes(sub));
            return `${k}: ${v}${needsImportant ? ' !important' : ''};`;
        })
        .join(' ');
}

export function parseSpecialProps(props = {}, attributes = {}) {
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

export function updateStyleString(props, styleRef) {
    const {attributes, name} = props;

    const {'wpbs-css': cssObj, uniqueId} = attributes;


    if (styleRef?.current && uniqueId) {
        const blockClass = name ? `.${name.replace('/', '-')}` : '';
        const selector = `${blockClass}.${uniqueId}`.trim();

        let cssString = '';

        if (!_.isEmpty(cssObj.props)) {
            cssString += `${selector} { ${propsToCss(cssObj.props)} }`;
        }

        for (const [bpKey, bpProps] of Object.entries(cssObj?.breakpoints || {})) {
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