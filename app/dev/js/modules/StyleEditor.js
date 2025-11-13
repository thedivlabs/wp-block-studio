import {
    CONTAINER_OPTIONS,
    REVEAL_ANIMATION_OPTIONS,
    REVEAL_EASING_OPTIONS,
    DISPLAY_OPTIONS,
    DIRECTION_OPTIONS,
    WRAP_OPTIONS,
    ALIGN_OPTIONS,
    JUSTIFY_OPTIONS,
    SHAPE_OPTIONS,
    WIDTH_OPTIONS,
    HEIGHT_OPTIONS,
    POSITION_OPTIONS,
    OVERFLOW_OPTIONS,
    CONTENT_VISIBILITY_OPTIONS,
    TEXT_ALIGN_OPTIONS,
    DIMENSION_UNITS,
    ORIGIN_OPTIONS,
    IMAGE_SIZE_OPTIONS,
    RESOLUTION_OPTIONS, BLEND_OPTIONS, REPEAT_OPTIONS, DIMENSION_UNITS_TEXT
} from "Includes/config";
import _ from "lodash";
import {getImageUrlForResolution, cleanObject} from "Includes/helper";


const SPECIAL_FIELDS = [
    'gap', 'margin', 'transform', 'filter', 'hide-empty', 'required',
    'offset-height', 'align-header', 'outline', 'box-shadow',

    'reveal-duration', 'reveal-easing', 'reveal-distance', 'reveal-anim', 'reveal-offset', 'reveal-delay',

    'breakpoint', 'mask-image', 'mask-repeat', 'mask-size', 'mask-origin',
    'flex-basis', 'height', 'height-custom', 'min-height', 'min-height-custom', 'max-height',
    'max-height-custom', 'width', 'width-custom', 'translate', 'offset-header', 'text-color',
    'text-decoration-color', 'position', 'container', 'padding', 'border',
    'border-radius', 'background-color'
];


function getCSSFromStyle(raw, presetKeyword = '') {
    if (raw == null) return '';

    if (typeof raw === 'object' && !Array.isArray(raw)) {
        return Object.entries(raw)
            .map(([k, v]) => `${k}: ${getCSSFromStyle(v, presetKeyword)};`)
            .join(' ');
    }

    if (Array.isArray(raw)) {
        return raw.map(v => getCSSFromStyle(v, presetKeyword)).join(', ');
    }

    if (typeof raw !== 'string') return raw;

    if (raw.startsWith('var:')) {
        const [source, type, name] = raw.slice(4).split('|');
        if (source && type && name) {
            return `var(--wp--${source}--${type}--${name})`;
        }
        return raw;
    }

    if (raw.startsWith('--wp--')) {
        return `var(${raw})`;
    }

    if (presetKeyword) {
        return `var(--wp--preset--${presetKeyword}--${raw})`;
    }

    return raw;
}

const heightVal = (val) => {
    let height = val;
    if (val === 'screen') height = 'calc(100svh - var(--wpbs-header-height, 0px))';
    if (val === 'full-screen') height = '100svh';
    if (['auto', 'full', 'inherit'].includes(val)) height = val;
    return height;
};

function parseSpecialProps(props = {}, attributes = {}) {
    const result = {};

    const containerMap = WPBS?.settings?.container ?? {};

    Object.entries(props).forEach(([key, val]) => {
        if (val == null) return;

        if (SPECIAL_FIELDS.includes(key)) {
            switch (key) {
                case 'colors': {
                    if (typeof val === 'object') {
                        Object.entries(val).forEach(([colorKey, colorVal]) => {
                            if (colorVal) {
                                result[colorKey] = colorVal;
                            }
                        });
                    }
                    break;
                }
                case 'margin':
                case 'padding':
                    if (typeof val === 'object') {
                        if (val.top) result[`${key}-top`] = val.top;
                        if (val.right) result[`${key}-right`] = val.right;
                        if (val.bottom) result[`${key}-bottom`] = val.bottom;
                        if (val.left) result[`${key}-left`] = val.left;
                    }
                    break;
                case 'gap':
                    result['row-gap'] = val.top ?? val;
                    result['column-gap'] = val.left ?? val;
                    result['--row-gap'] = val.top ?? val;
                    result['--column-gap'] = val.left ?? val;
                    break;
                case 'container':
                    result['--container-width'] = containerMap[val] ?? val;
                    break;

                case 'height':
                case 'height-custom': {
                    result['height'] = props?.['height-custom'] ?? props?.['height'] ?? val;
                    if (result['height'] === 'screen') result['height'] = '100svh';
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
                        if (val.top) result['border-top'] = Object.values({style: 'solid', ...val.top}).join(' ');
                        if (val.right) result['border-right'] = Object.values({style: 'solid', ...val.right}).join(' ');
                        if (val.bottom) result['border-bottom'] = Object.values({style: 'solid', ...val.bottom}).join(' ');
                        if (val.left) result['border-left'] = Object.values({style: 'solid', ...val.left}).join(' ');
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
                        if (val.top) result['outline-top'] = Object.values({style: 'solid', ...val.top}).join(' ');
                        if (val.right) result['outline-right'] = Object.values({style: 'solid', ...val.right}).join(' ');
                        if (val.bottom) result['outline-bottom'] = Object.values({style: 'solid', ...val.bottom}).join(' ');
                        if (val.left) result['outline-left'] = Object.values({style: 'solid', ...val.left}).join(' ');
                    }
                    break;
                }

                case 'text-color':
                    result['color'] = val;
                    break;

                case 'text-decoration-color':
                    result['text-decoration-color'] = `${val} !important`;
                    result['text-underline-offset'] = '.3em';
                    break;

                case 'translate':
                    result['transform'] = `translate(${getCSSFromStyle(val?.left || '0px')}, ${getCSSFromStyle(val?.top || '0px')})`;
                    break;

                case 'offset-header':
                    result['padding-top'] = `calc(${getCSSFromStyle(attributes?.style?.spacing?.padding?.top || '0px')} + var(--wpbs-header-height, 0px) + ${val || '0px'}) !important`;
                    break;

                case 'align-header':
                    result['top'] = 'var(--wpbs-header-height, auto)';
                    break;

                case 'box-shadow':
                    result['box-shadow'] = val?.shadow || val;
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

function parseBackgroundProps(props = {}) {

    const result = {};
    const {image, resolution = 'large', force} = props;

    // If the minimal image blob exists, rebuild the correct-size URL
    if (image?.id && image?.source) {
        const url = getImageUrlForResolution(image, resolution);
        if (url) {
            result["--image"] = `url("${url}")`;
        }
    } else if (force) {
        result["--image"] = "#";
    }

    // --- Video ---
    if (videoObj) {
        result['--video'] = 'block';
        result['--video-src'] = videoObj.source_url; // if you want video URL support
    } else {
        result['--video'] = 'none';
    }

    // --- Common visual modifiers ---
    Object.entries(props).forEach(([key, val]) => {
        if (val == null) return;
        switch (key) {
            case 'background-size':
                result['--size'] = val;
                break;
            case 'scale':
                result['--scale'] = `${parseFloat(val)}%`;
                break;
            case 'opacity':
                result['--opacity'] = parseFloat(val) / 100;
                break;
            case 'fade':
                result['--fade'] = val;
                break;
            case 'max-height':
                result['--max-height'] = val;
                break;
            case 'overlay':
                result['--overlay'] = val;
                break;
            case 'color':
                result['--color'] = val;
                break;
            case 'background-blend-mode':
                result['--blend'] = val;
                break;
            case 'mask-image': {
                const imageUrl =
                    typeof val === 'object' && val?.url
                        ? val.url
                        : typeof val === 'string'
                            ? val
                            : null;

                result['--mask-image'] = imageUrl ? `url(${imageUrl})` : 'none';
                result['--mask-repeat'] = 'no-repeat';
                result['--mask-size'] = props.maskSize || 'contain';
                result['--mask-position'] = props.maskOrigin || 'center center';
                break;
            }
            case 'mask-origin':
                result['--mask-position'] = val;
                break;
            case 'mask-size':
                result['--mask-size'] = val;
                break;
            default:
                break;
        }
    });

    if (props.fixed) {
        result['--attachment'] = 'fixed';
    } else if (hasMedia) {
        result['--attachment'] = 'scroll';
    }

    return result;
}

const layoutFieldsMap = [
    {type: 'select', slug: 'align-items', label: 'Align', options: ALIGN_OPTIONS},
    {type: 'unit', slug: 'flex-basis', label: 'Basis'},
    {type: 'select', slug: 'container', label: 'Container', options: CONTAINER_OPTIONS},
    {type: 'select', slug: 'display', label: 'Display', options: DISPLAY_OPTIONS},
    {type: 'select', slug: 'flex-direction', label: 'Direction', options: DIRECTION_OPTIONS},
    {type: 'unit', slug: 'transition-duration', label: 'Duration', units: [{value: 'ms', label: 'ms', default: 0}],},
    {type: 'select', slug: 'flex-wrap', label: 'Flex Wrap', options: WRAP_OPTIONS},
    {type: 'unit', slug: 'font-size', label: 'Font Size', units: DIMENSION_UNITS_TEXT},
    {type: 'number', slug: 'flex-grow', label: 'Grow'},
    {type: 'select', slug: 'height', label: 'Height', options: HEIGHT_OPTIONS},
    {type: 'unit', slug: 'height-custom', label: 'Height Custom'},
    {type: 'select', slug: 'justify-content', label: 'Justify', options: JUSTIFY_OPTIONS},
    {type: 'unit', slug: 'line-height', label: 'Line Height'},
    {
        type: 'select',
        slug: 'mask-origin', // CSS mask-origin
        label: 'Mask Origin',
        options: ORIGIN_OPTIONS,
    },
    {
        type: 'select',
        slug: 'mask-size', // CSS mask-size
        label: 'Mask Size',
        options: IMAGE_SIZE_OPTIONS,
    },
    {type: 'unit', slug: 'max-height', label: 'Max-Height', units: DIMENSION_UNITS},
    {type: 'unit', slug: 'max-width', label: 'Max-Width'},
    {type: 'select', slug: 'min-height', label: 'Min-Height', options: HEIGHT_OPTIONS},
    {type: 'unit', slug: 'min-height-custom', label: 'Min-Height Custom'},
    {type: 'unit', slug: 'offset-header', label: 'Offset Header'},
    {type: 'number', slug: 'opacity', label: 'Opacity'},
    {type: 'number', slug: 'order', label: 'Order'},
    {type: 'select', slug: 'overflow', label: 'Overflow', options: OVERFLOW_OPTIONS},
    {type: 'select', slug: 'position', label: 'Position', options: POSITION_OPTIONS},
    {type: 'select', slug: 'reveal-anim', label: 'Reveal', options: REVEAL_ANIMATION_OPTIONS},
    {
        type: 'unit',
        slug: 'reveal-duration',
        label: 'Reveal Speed',
        inputProps: {units: [{value: 'ms', label: 'ms', default: 0}]}
    },
    {type: 'number', slug: 'reveal-delay', label: 'Reveal Delay'},
    {type: 'select', slug: 'reveal-easing', label: 'Reveal Easing', options: REVEAL_EASING_OPTIONS},
    {type: 'unit', slug: 'reveal-distance', label: 'Reveal Distance'},
    {type: 'unit', slug: 'reveal-offset', label: 'Reveal Offset'},
    {type: 'select', slug: 'aspect-ratio', label: 'Shape', options: SHAPE_OPTIONS},
    {type: 'number', slug: 'flex-shrink', label: 'Shrink'},
    {type: 'select', slug: 'text-align', label: 'Text Align', options: TEXT_ALIGN_OPTIONS},
    {type: 'select', slug: 'content-visibility', label: 'Visibility', options: CONTENT_VISIBILITY_OPTIONS},
    {type: 'select', slug: 'width', label: 'Width', options: WIDTH_OPTIONS},
    {type: 'unit', slug: 'width-custom', label: 'Width Custom'},
    {type: 'number', slug: 'z-index', label: 'Z Index'},
    {
        type: 'box',
        slug: 'box-position',
        label: 'Box Position',
        full: true,
        sides: ['top', 'right', 'bottom', 'left'],
        inputProps: {units: DIMENSION_UNITS},
    },
    {type: 'box', slug: 'gap', label: 'Gap', sides: ['top', 'left'], full: true},
    {
        type: 'box',
        slug: 'margin',
        label: 'Margin',
        full: true,
        sides: ['top', 'right', 'bottom', 'left'],
        inputProps: {units: DIMENSION_UNITS},
    },
    {type: 'border', slug: 'outline', label: 'Outline', full: true},
    {
        type: 'box',
        slug: 'padding',
        label: 'Padding',
        full: true,
        sides: ['top', 'right', 'bottom', 'left'],
        inputProps: {units: DIMENSION_UNITS},
    },
    {type: 'shadow', slug: 'box-shadow', label: 'Shadow', full: true},
    {type: 'box', slug: 'border-radius', label: 'Radius', full: true},
    {
        type: 'box',
        slug: 'translate',
        label: 'Translate',
        sides: ['top', 'left'],
        inputProps: {
            units: DIMENSION_UNITS,
            min: -1000,
            max: 1000,
        },
        full: true,
    },
    {
        type: 'image',
        slug: 'mask-image', // maps to CSS mask-image
        label: 'Mask Image',
        full: true,
    },
];

const hoverFieldsMap = [
    {
        type: "color",
        slug: "hover",
        label: "Hover Colors",
        full: true,
        colors: [
            {slug: "background-color", label: "Background"},
            {slug: "color", label: "Text"},
            {slug: "border-color", label: "Border"},
            {slug: "outline-color", label: "Outline"},
        ],
    },
    {type: "shadow", slug: "box-shadow", label: "Shadow", full: true},
];

const backgroundFieldsMap = [

    // --- Core CSS background properties ---
    {
        type: 'select',
        slug: 'resolution', // non-CSS; used internally for imageSet()
        label: 'Resolution',
        options: RESOLUTION_OPTIONS,
    },
    {
        type: 'select',
        slug: 'background-size',
        label: 'Size',
        options: IMAGE_SIZE_OPTIONS,
    },
    {
        type: 'select',
        slug: 'background-blend-mode',
        label: 'Blend Mode',
        options: BLEND_OPTIONS,
    },
    {
        type: 'select',
        slug: 'background-position',
        label: 'Position',
        options: POSITION_OPTIONS,
    },
    {
        type: 'select',
        slug: 'background-origin',
        label: 'Origin',
        options: ORIGIN_OPTIONS,
    },
    {
        type: 'select',
        slug: 'background-repeat',
        label: 'Repeat',
        options: REPEAT_OPTIONS,
    },
    {
        type: 'unit',
        slug: 'max-height', // not background-related CSS; applies to wrapper
        label: 'Max Height',
        units: [{value: 'vh', label: 'vh', default: 0}],
    },

    // --- Visual modifiers (non-standard CSS, custom implementation) ---
    {
        type: 'range',
        slug: 'scale', // handled via transform/scale()
        label: 'Scale',
        min: 0,
        max: 200,
        full: true,
    },
    {
        type: 'range',
        slug: 'opacity', // maps to CSS opacity
        label: 'Opacity',
        min: 0,
        max: 100,
        full: true,
    },
    {
        type: 'range',
        slug: 'width', // applied to media container, not CSS background-width
        label: 'Width',
        min: 0,
        max: 100,
        full: true,
    },
    {
        type: 'range',
        slug: 'height', // same as above
        label: 'Height',
        min: 0,
        max: 100,
        full: true,
    },
    {
        type: 'gradient',
        slug: 'fade',
        label: 'Fade',
        full: true,
    },

    // --- Mask and overlay ---
    {
        type: 'image',
        slug: 'mask-image', // maps to CSS mask-image
        label: 'Mask Image',
        full: true,
    },
    {
        type: 'select',
        slug: 'mask-origin', // CSS mask-origin
        label: 'Mask Origin',
        options: ORIGIN_OPTIONS,
    },
    {
        type: 'select',
        slug: 'mask-size', // CSS mask-size
        label: 'Mask Size',
        options: IMAGE_SIZE_OPTIONS,
    },
];

export function initStyleEditor() {
    if (window.WPBS_StyleEditor) return window.WPBS_StyleEditor;

    const api = {
        layoutFieldsMap,
        hoverFieldsMap,
        backgroundFieldsMap,
        cleanObject,
        getCSSFromStyle,
        parseSpecialProps,
        parseBackgroundProps,
    };

    function startDuplicateWatcher() {
        const {subscribe, select, dispatch} = wp.data;
        const store = 'core/block-editor';
        let lastSig = '';

        // Recursive flatten of all wpbs/ blocks
        const flattenWPBSBlocks = (arr, acc = []) => {
            for (const b of arr) {
                if (b.name?.startsWith('wpbs/')) {
                    acc.push(b);
                }
                if (b.innerBlocks?.length) flattenWPBSBlocks(b.innerBlocks, acc);
            }
            return acc;
        };

        subscribe(() => {
            try {
                const rootBlocks = select(store).getBlocks();
                if (!rootBlocks.length) return;

                // flatten all nested wpbs/ blocks
                const wpbsBlocks = flattenWPBSBlocks(rootBlocks);

                // build a signature to avoid redundant passes
                const sig = wpbsBlocks.map(b => `${b.clientId}:${b.attributes?.uniqueId ?? ''}`).join('|');
                if (sig === lastSig) return;
                lastSig = sig;

                const seen = new Set();

                for (const b of wpbsBlocks) {
                    const {attributes = {}, name, clientId} = b;
                    const baseName = name.replace('/', '-');
                    const uid = attributes.uniqueId;

                    // missing, invalid, or duplicate ID → regenerate
                    if (!uid || !uid.startsWith(baseName) || seen.has(uid)) {
                        const newId = `${baseName}-${Math.random().toString(36).slice(2, 8)}`;
                        dispatch(store).updateBlockAttributes(clientId, {uniqueId: newId});
                    } else {
                        seen.add(uid);
                    }
                }
            } catch (err) {
                console.warn('WPBS: duplicate watcher error', err);
            }
        });
    }

    function startCssManager() {
        const {subscribe, select} = wp.data;
        const store = 'core/block-editor';
        const blockCssMap = new Map();
        let prevIds = new Set();
        let flushTimer = null;

        // ensure <style> exists
        let styleEl = document.getElementById('wpbs-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'wpbs-styles';
            document.head.appendChild(styleEl);
        }

        const flattenWPBSBlocks = (arr, acc = []) => {
            for (const b of arr) {
                if (b.name?.startsWith('wpbs/')) acc.push(b);
                if (b.innerBlocks?.length) flattenWPBSBlocks(b.innerBlocks, acc);
            }
            return acc;
        };

        const scheduleFlush = () => {
            clearTimeout(flushTimer);
            flushTimer = setTimeout(flush, 120);
        };

        const flush = () => {
            const css = Array.from(blockCssMap.entries())
                .map(([uid, cssText]) => `/* ${uid} */\n${cssText}`)
                .join('\n');
            if (styleEl.textContent !== css) {
                styleEl.textContent = css;
            }
        };

        const buildRules = (obj = {}, important = false) =>
            Object.entries(obj)
                .filter(([_, v]) => v != null && v !== '')
                .map(([k, v]) => `${k}:${v}${important ? ' !important' : ''};`)
                .join(' ');

        const computeCssForBlock = (block) => {
            const cssObj = block.attributes?.['wpbs-css'];
            const uid = block.attributes?.uniqueId;
            const name = block.name;
            if (!cssObj || !uid) return '';

            const selector = `.${name.replace('/', '-')}.${uid}`;
            let css = '';

            // --- Base props (merged with custom) ---
            const merged = {...(cssObj.props || {}), ...(cssObj.custom || {})};
            if (!_.isEmpty(merged)) {
                css += `${selector}{${buildRules(merged)}}`;
            }

            // --- Background (scope to > .wpbs-background) ---
            if (!_.isEmpty(cssObj.background)) {
                const bgSelector = `${selector} > .wpbs-background`;
                css += `${bgSelector}{${buildRules(cssObj.background)}}`;
            }

            // --- Hover ---
            if (!_.isEmpty(cssObj.hover)) {
                css += `${selector}:hover{${buildRules(cssObj.hover, true)}}`;
            }

            // --- Breakpoints ---
            const bps = WPBS?.settings?.breakpoints || {};
            for (const [bpKey, bpProps] of Object.entries(cssObj.breakpoints || {})) {
                const bp = bps[bpKey];
                if (bp && !_.isEmpty(bpProps)) {
                    // merge props, custom, and background vars
                    const mergedBp = {
                        ...(bpProps.props || {}),
                        ...(bpProps.custom || {}),
                        ...(bpProps.background || {}),
                    };

                    // only build rule if something meaningful exists
                    if (!_.isEmpty(mergedBp)) {
                        css += `@media (max-width:${bp.size - 1}px){${selector}{${buildRules(mergedBp, true)}}}`;
                    }
                }
            }


            return css;
        };

        subscribe(() => {
            try {
                const rootBlocks = select(store).getBlocks();
                if (!rootBlocks.length) return;

                const blocks = flattenWPBSBlocks(rootBlocks);
                const currentIds = new Set();

                for (const b of blocks) {
                    const uid = b.attributes?.uniqueId;
                    if (!uid) continue;
                    currentIds.add(uid);

                    const cssText = computeCssForBlock(b);
                    if (cssText && blockCssMap.get(uid) !== cssText) {
                        blockCssMap.set(uid, cssText);
                        scheduleFlush();
                    }
                }

                // Deletions
                for (const oldId of prevIds) {
                    if (!currentIds.has(oldId) && blockCssMap.has(oldId)) {
                        blockCssMap.delete(oldId);
                        scheduleFlush();
                    }
                }

                prevIds = currentIds;
            } catch (err) {
                console.warn('WPBS: CSS manager error', err);
            }
        });
    }

    startDuplicateWatcher();
    startCssManager();

    window.WPBS_StyleEditor = api;
    return api;
}