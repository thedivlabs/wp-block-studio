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
    RESOLUTION_OPTIONS, BLEND_OPTIONS, REPEAT_OPTIONS
} from "Includes/config";
import _ from "lodash";

const SPECIAL_FIELDS = [
    'gap', 'margin', 'box-shadow', 'transform', 'filter', 'hide-empty', 'required',
    'offset-height', 'align-header', 'outline', 'duration', 'reveal', 'reveal-easing',
    'reveal-duration', 'reveal-offset', 'reveal-distance', 'reveal-repeat', 'reveal-mirror',
    'transition', 'breakpoint', 'mask-image', 'mask-repeat', 'mask-size', 'mask-origin',
    'basis', 'height', 'height-custom', 'min-height', 'min-height-custom', 'max-height',
    'max-height-custom', 'width', 'width-custom', 'translate', 'offset-header', 'text-color',
    'text-decoration-color', 'position', 'container', 'padding', 'shadow', 'border',
    'border-radius', 'background-color',

    'bgType',
    'bgImage',
    'bgVideo',
    'bgEager',
    'bgFixed',
    'bgResolution',
    'bgMaxHeight',
    'bgScale',
    'bgOpacity',
    'bgWidth',
    'bgHeight',
    'bgFade',
    'bgMaskImage',
    'bgMaskOrigin',
    'bgMaskSize',
    'bgOverlay'
];

function cleanObject(obj, strict = false) {
    return _.transform(obj, (result, value, key) => {
        if (_.isPlainObject(value)) {
            const cleaned = cleanObject(value, strict);
            if (!_.isEmpty(cleaned)) {
                result[key] = cleaned;
            }
        } else if (Array.isArray(value)) {
            const cleanedArray = value
                .map((v) => (_.isPlainObject(v) ? cleanObject(v, strict) : v))
                .filter((v) => v !== undefined && v !== null && (!strict || (v !== '' && !(typeof v === 'string' && v.trim() === ''))));

            if (cleanedArray.length > 0) {
                result[key] = cleanedArray;
            }
        } else if (value !== undefined && value !== null) {
            if (strict && typeof value === 'string' && value.trim() === '') {
                // skip empty strings in strict mode
                return;
            }
            result[key] = value;
        }
    }, {});
}

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

function imageSet(media, resolution = 'large') {
    if (!media) return '';

    // Try to get the URL for the specified resolution
    const size = media?.sizes?.[resolution];
    const url = size?.url ?? media?.url ?? null;

    if (!url) return '';

    // Detect image type for the fallback
    const isPng = url.toLowerCase().endsWith('.png');
    const ext = isPng ? 'image/png' : 'image/jpeg';

    // Construct the image-set() syntax
    const webp = `url("${url}.webp") type("image/webp")`;
    const fallback = `url("${url}") type("${ext}")`;

    return `image-set(${webp}, ${fallback})`;
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
                    result['transform'] = `translate(${getCSSFromStyle(val?.left || '0px')}, ${getCSSFromStyle(val?.top || '0px')})`;
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

function parseBackgroundProps(props = {}) {
    const result = {};

    Object.entries(props).forEach(([key, val]) => {
        if (val == null) return;

        switch (key) {
            // --- Base background div ---
            case 'image':
                result['--bg-image'] = imageSet(val, props.resolution || 'large');
                break;
            case 'video':
                if (val?.url) {
                    result['--bg-video'] = `url(${val.url})`;
                }
                break;
            case 'fixed':
                result['--bg-attachment'] = 'fixed';
                break;
            case 'scale':
                result['--bg-size'] = `${parseFloat(val)}%`;
                break;
            case 'opacity':
                result['--bg-opacity'] = parseFloat(val) / 100;
                break;
            case 'width':
            case 'height':
                result[`--${key}`] = `${val}%`;
                break;
            case 'fade':
                // Fade affects the main background div (gradient overlay)
                result['--bg-fade'] = `linear-gradient(to bottom, #000000ff ${val}%, #00000000 100%)`;
                break;
            case 'overlay':
                result['--bg-overlay'] = val;
                break;

            // --- Pseudo-element mask layer ---
            case 'maskImage':
                result['--bg-mask-image'] = `url(${val?.url ?? '#'})`;
                result['--bg-mask-repeat'] = 'no-repeat';
                result['--bg-mask-size'] = props.maskSize || 'contain';
                result['--bg-mask-position'] = props.maskOrigin || 'center center';
                break;
            case 'maskOrigin':
                result['--bg-mask-position'] = val;
                break;
            case 'maskSize':
                result['--bg-mask-size'] = val;
                break;

            default:
                break;
        }
    });

    return result;
}

const layoutFieldsMap = [
    {type: 'heading', label: 'Flex Settings FPO'},
    {type: 'select', slug: 'align-items', label: 'Align', options: ALIGN_OPTIONS},
    {type: 'unit', slug: 'basis', label: 'Basis'},
    {type: 'box', slug: 'border-radius', label: 'Radius', full: true},
    {
        type: 'box',
        slug: 'box-position',
        label: 'Box Position',
        full: true,
        options: {
            sides: ['top', 'right', 'bottom', 'left'],
            inputProps: {units: DIMENSION_UNITS},
        },
    },
    {type: 'select', slug: 'container', label: 'Container', options: CONTAINER_OPTIONS},
    {type: 'select', slug: 'content-visibility', label: 'Visibility', options: CONTENT_VISIBILITY_OPTIONS},
    {type: 'select', slug: 'display', label: 'Display', options: DISPLAY_OPTIONS},
    {type: 'select', slug: 'flex-direction', label: 'Direction', options: DIRECTION_OPTIONS},
    {type: 'number', slug: 'flex-grow', label: 'Grow'},
    {type: 'box', slug: 'gap', label: 'Gap', options: {sides: ['top', 'left']}},
    {type: 'select', slug: 'height', label: 'Height', options: HEIGHT_OPTIONS},
    {type: 'unit', slug: 'height-custom', label: 'Height Custom'},
    {type: 'select', slug: 'justify-content', label: 'Justify', options: JUSTIFY_OPTIONS},
    {type: 'unit', slug: 'line-height', label: 'Line Height'},
    {
        type: 'box',
        slug: 'margin',
        label: 'Margin',
        full: true,
        options: {
            sides: ['top', 'right', 'bottom', 'left'],
            inputProps: {units: DIMENSION_UNITS},
        },
    },
    {type: 'unit', slug: 'max-height', label: 'Max Height'},
    {type: 'unit', slug: 'max-height-custom', label: 'Max-Height Custom'},
    {type: 'unit', slug: 'max-width', label: 'Max Width'},
    {type: 'unit', slug: 'min-height', label: 'Min Height'},
    {type: 'unit', slug: 'min-height-custom', label: 'Min-Height Custom'},
    {type: 'number', slug: 'opacity', label: 'Opacity'},
    {type: 'unit', slug: 'offset-header', label: 'Offset Header'},
    {type: 'unit', slug: 'order', label: 'Order'},
    {
        type: 'box',
        slug: 'padding',
        label: 'Padding',
        full: true,
        options: {
            sides: ['top', 'right', 'bottom', 'left'],
            inputProps: {units: DIMENSION_UNITS},
        },
    },
    {type: 'select', slug: 'position', label: 'Position', options: POSITION_OPTIONS},
    {type: 'select', slug: 'aspect-ratio', label: 'Shape', options: SHAPE_OPTIONS},
    {type: 'shadow', slug: 'shadow', label: 'Shadow'},
    {type: 'border', slug: 'outline', label: 'Outline'},
    {type: 'unit', slug: 'font-size', label: 'Font Size'},
    {type: 'unit', slug: 'flex-shrink', label: 'Shrink'},
    {type: 'select', slug: 'flex-wrap', label: 'Flex Wrap', options: WRAP_OPTIONS},
    {type: 'select', slug: 'text-align', label: 'Text Align', options: TEXT_ALIGN_OPTIONS},
    {
        type: 'box',
        slug: 'translate',
        label: 'Translate',
        options: {
            sides: ['top', 'left'],
            inputProps: {units: DIMENSION_UNITS},
        },
        full: true,
    },
    {type: 'select', slug: 'overflow', label: 'Overflow', options: OVERFLOW_OPTIONS},
    {type: 'number', slug: 'reveal-duration', label: 'Reveal Duration'},
    {type: 'select', slug: 'reveal-easing', label: 'Reveal Easing', options: REVEAL_EASING_OPTIONS},
    //{type: 'toggle', slug: 'reveal-mirror', label: 'Reveal Mirror'},
    {type: 'unit', slug: 'reveal-offset', label: 'Reveal Offset'},
    //{type: 'toggle', slug: 'reveal-repeat', label: 'Reveal Repeat'},
    {type: 'unit', slug: 'reveal-distance', label: 'Reveal Distance'},
    {type: 'select', slug: 'reveal-anim', label: 'Reveal Animation', options: REVEAL_ANIMATION_OPTIONS},
    {type: 'number', slug: 'z-index', label: 'Z Index'},
    {type: 'select', slug: 'width', label: 'Width', options: WIDTH_OPTIONS},
    {type: 'unit', slug: 'width-custom', label: 'Width Custom'},
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

const backgroundFieldsMap = [
    // Base
    {
        type: 'color',
        slug: 'background-color',
        label: 'Color',
    },

    // --- Core background CSS props ---
    {
        type: 'select',
        slug: 'bgResolution',
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
        slug: 'bgMaxHeight',
        label: 'Max Height',
        units: [{value: 'vh', label: 'vh', default: 0}],
    },

    // --- Advanced / visual modifiers ---
    {
        type: 'range',
        slug: 'bgScale',
        label: 'Scale',
        min: 0,
        max: 200,
        full: true,
    },
    {
        type: 'range',
        slug: 'bgOpacity',
        label: 'Opacity',
        min: 0,
        max: 100,
        full: true,
    },
    {
        type: 'range',
        slug: 'bgWidth',
        label: 'Width',
        min: 0,
        max: 100,
        full: true,
    },
    {
        type: 'range',
        slug: 'bgHeight',
        label: 'Height',
        min: 0,
        max: 100,
        full: true,
    },
    {
        type: 'range',
        slug: 'bgFade',
        label: 'Fade',
        min: 0,
        max: 100,
        full: true,
    },

    // --- Mask and overlay ---
    {
        type: 'image',
        slug: 'bgMaskImage',
        label: 'Mask Image',
        full: true,
    },
    {
        type: 'select',
        slug: 'bgMaskOrigin',
        label: 'Mask Origin',
        options: ORIGIN_OPTIONS,
    },
    {
        type: 'select',
        slug: 'bgMaskSize',
        label: 'Mask Size',
        options: IMAGE_SIZE_OPTIONS,
    }
];

function updateStyleString(props, styleRef) {
    const {attributes, name} = props;
    const cssObj = attributes['wpbs-css'];
    const uniqueId = attributes?.uniqueId;

    if (!styleRef?.current || !uniqueId || !cssObj) return;

    const selector = [
        name ? `.${name.replace('/', '-')}` : '',
        `.${uniqueId}`
    ].join('').trim();

    const buildRules = (props, important = false) =>
        Object.entries(props || {})
            .filter(([_, v]) => v != null && v !== '')
            .map(([k, v]) => `${k}: ${v}${important ? ' !important' : ''};`)
            .join(' ');

    let css = '';

    // Base props
    if (!_.isEmpty(cssObj.props)) {
        css += `${selector} { ${buildRules(cssObj.props)} }`;
    }

    // Breakpoints
    for (const [bpKey, bpProps] of Object.entries(cssObj.breakpoints || {})) {
        const bp = WPBS?.settings?.breakpoints?.[bpKey];
        if (bp && !_.isEmpty(bpProps)) {
            css += `@media (max-width: ${bp.size - 1}px) { ${selector} { ${buildRules(bpProps, true)} } }`;
        }
    }

    // Hover
    if (!_.isEmpty(cssObj.hover)) {
        css += `${selector}:hover { ${buildRules(cssObj.hover)} }`;
    }

    const newCSS = css.trim();
    if (styleRef.current.textContent !== newCSS) {
        styleRef.current.textContent = newCSS;
    }

    return newCSS;
}

function buildBackgroundVideo(layout = {}) {
    if (!layout || typeof layout !== 'object') return null;

    const bpDefs = WPBS?.settings?.breakpoints ?? {};
    const entries = [];

    // 1. base-level background video
    if (layout.background?.video?.url) {
        entries.push({size: Infinity, video: layout.background.video});
    }

    // 2. breakpoints
    Object.entries(layout.breakpoints || {}).forEach(([bpKey, bpData]) => {
        const video = bpData?.background?.video;
        const size = bpDefs[bpKey]?.size ?? 0;
        if (video?.url) entries.push({size, video});
    });

    entries.sort((a, b) => b.size - a.size);

    if (!entries.length) return null;

    return (
        <video muted loop autoPlay playsInline>
            {entries.map(({size, video}, i) => (
                <source
                    key={i}
                    data-src={video.url}
                    data-media={Number.isFinite(size) && size !== Infinity ? `(max-width: ${size - 1}px)` : null}
                    //data-type={video.mime || 'video/mp4'}
                />
            ))}
        </video>
    );
}

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
        const { subscribe, select } = wp.data;
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
            const merged = { ...(cssObj.props || {}), ...(cssObj.custom || {}) };
            if (!_.isEmpty(merged)) {
                css += `${selector}{${buildRules(merged)}}`;
            }

            // --- Background ---
            if (!_.isEmpty(cssObj.background)) {
                css += `${selector}{${buildRules(cssObj.background)}}`;
            }

            // --- Hover ---
            if (!_.isEmpty(cssObj.hover)) {
                css += `${selector}:hover{${buildRules(cssObj.hover)}}`;
            }

            // --- Breakpoints ---
            const bps = WPBS?.settings?.breakpoints || {};
            for (const [bpKey, bpProps] of Object.entries(cssObj.breakpoints || {})) {
                const bp = bps[bpKey];
                if (bp && !_.isEmpty(bpProps)) {
                    const mergedBp = { ...(bpProps.props || {}), ...(bpProps.custom || {}) };
                    css += `@media (max-width:${bp.size - 1}px){${selector}{${buildRules(mergedBp, true)}}}`;
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