import _ from "lodash";
import {
    getImageUrlForResolution,
    cleanObject,
    heightVal,
    getCSSFromStyle
} from "Includes/helper";
import {
    layoutFieldsMap,
    hoverFieldsMap,
    backgroundFieldsMap,
} from "Includes/config";

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
                    result['min-height'] =
                        heightVal(props?.['min-height-custom'] ?? props?.['min-height'] ?? val);
                    break;

                case 'max-height':
                case 'max-height-custom':
                    result['max-height'] =
                        heightVal(props?.['max-height-custom'] ?? props?.['max-height'] ?? val);
                    break;

                case 'width':
                case 'width-custom':
                    result['width'] = props?.['width-custom'] ?? props?.['width'] ?? val;
                    break;

                case 'mask-image': {
                    const maskVal = val;

                    const isPlaceholder =
                        maskVal?.isPlaceholder === true ||
                        maskVal?.source === "#";

                    if (maskVal === "" || maskVal == null) {
                        // cleared → emit nothing
                        break;
                    }

                    if (isPlaceholder) {
                        // placeholder → physically no mask
                        result['mask-image'] = 'none';
                        result['mask-repeat'] = 'initial';
                        result['mask-size'] = 'initial';
                        result['mask-position'] = 'initial';
                        break;
                    }

                    // real mask object
                    const maskUrl =
                        typeof maskVal === "object" && maskVal?.source
                            ? maskVal.source
                            : typeof maskVal === "string"
                                ? maskVal
                                : null;

                    if (!maskUrl) break;

                    result['mask-image'] = `url("${maskUrl}")`;
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

                    result['mask-position'] =
                        props?.['mask-origin'] || 'center center';

                    break;
                }


                case 'border': {
                    if (typeof val === 'object') {
                        if (val.top)
                            result['border-top'] = Object.values({style: 'solid', ...val.top}).join(' ');
                        if (val.right)
                            result['border-right'] = Object.values({style: 'solid', ...val.right}).join(' ');
                        if (val.bottom)
                            result['border-bottom'] = Object.values({style: 'solid', ...val.bottom}).join(' ');
                        if (val.left)
                            result['border-left'] = Object.values({style: 'solid', ...val.left}).join(' ');
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
                        if (val.top)
                            result['outline-top'] = Object.values({style: 'solid', ...val.top}).join(' ');
                        if (val.right)
                            result['outline-right'] = Object.values({style: 'solid', ...val.right}).join(' ');
                        if (val.bottom)
                            result['outline-bottom'] = Object.values({style: 'solid', ...val.bottom}).join(' ');
                        if (val.left)
                            result['outline-left'] = Object.values({style: 'solid', ...val.left}).join(' ');
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

    const {
        image,
        video,
        resolution = "large",
        ...rest
    } = props;

    /* ------------------------------------------------------------
       IMAGE (matches PreviewThumbnail)
    ------------------------------------------------------------ */
    const isImagePlaceholder =
        image?.isPlaceholder === true ||
        image?.source === "#";

    if (image === "" || image == null) {
        // cleared → no --image
    } else if (isImagePlaceholder) {
        result["--image"] = "#";
    } else if (image?.source) {
        const url = getImageUrlForResolution(image, resolution);
        result["--image"] = `url("${url}")`;
    }

    /* ------------------------------------------------------------
       VIDEO (same 3-state model)
    ------------------------------------------------------------ */
    const isVideoPlaceholder =
        video?.isPlaceholder === true ||
        video?.source === "#";

    if (video === "" || video == null) {
        result["--video"] = "none";
    } else if (isVideoPlaceholder) {
        result["--video"] = "block";
        result["--video-src"] = "#";
    } else if (video?.source) {
        result["--video"] = "block";
        result["--video-src"] = video.source;
    }

    /* ------------------------------------------------------------
       MASK (placeholder = none)
    ------------------------------------------------------------ */
    const maskVal = rest["mask-image"];
    const isMaskPlaceholder =
        maskVal?.isPlaceholder === true ||
        maskVal?.source === "#";

    if (maskVal === "" || maskVal == null) {
        // cleared → emit nothing
    } else if (isMaskPlaceholder) {
        result["--mask-image"] = "none";
        result["--mask-repeat"] = "initial";
        result["--mask-size"] = "initial";
        result["--mask-position"] = "initial";
    } else {
        const maskUrl =
            typeof maskVal === "object" && maskVal?.source
                ? maskVal.source
                : typeof maskVal === "string"
                    ? maskVal
                    : null;

        if (maskUrl) {
            result["--mask-image"] = `url("${maskUrl}")`;
            result["--mask-repeat"] = "no-repeat";
            result["--mask-size"] = props.maskSize || "contain";
            result["--mask-position"] = props.maskOrigin || "center center";
        }
    }

    /* ------------------------------------------------------------
       OTHER PROPS
    ------------------------------------------------------------ */
    Object.entries(rest).forEach(([key, val]) => {
        if (val == null) return;

        switch (key) {
            case "background-size":
                result["--size"] = val;
                break;
            case "scale":
                result["--scale"] = `${parseFloat(val)}%`;
                break;
            case "opacity":
                result["--opacity"] = parseFloat(val) / 100;
                break;
            case "fade":
                result["--fade"] = val;
                break;
            case "max-height":
                result["--max-height"] = val;
                break;
            case "overlay":
                result["--overlay"] = val;
                break;
            case "color":
                result["--color"] = val;
                break;
            case "background-blend-mode":
                result["--blend"] = val;
                break;
        }
    });

    /* ------------------------------------------------------------
       Attachment
    ------------------------------------------------------------ */
    if (props.fixed) {
        result["--attachment"] = "fixed";
    } else if (image?.source) {
        result["--attachment"] = "scroll";
    }

    return result;
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