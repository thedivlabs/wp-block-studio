import _ from "lodash";
import {
    normalizeGapVal,
    getImageUrlForResolution,
    cleanObject,
    heightVal,
    buildImageSet,
    diffObjects,
    getCSSFromStyle,
    normalizePreloadItem,
    extractPreloadsFromLayout,
} from "Includes/helper";
import {
    layoutFieldsMap,
    hoverFieldsMap,
    backgroundFieldsMap,
} from "Includes/config";
import {updateEditorIcons} from './icons'

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

                case 'gap': {
                    const rawTop = val?.top ?? null;
                    const rawLeft = val?.left ?? null;

                    const top = normalizeGapVal(rawTop);
                    const left = normalizeGapVal(rawLeft);

                    if (top) {
                        result['row-gap'] = top;
                        result['--row-gap'] = top;
                    }

                    if (left) {
                        result['column-gap'] = left;
                        //result['--column-gap'] = left;
                    }

                    break;
                }

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
                        break;
                    }

                    if (isPlaceholder) {
                        result['mask-image'] = 'none';
                        result['mask-repeat'] = 'initial';
                        result['mask-size'] = 'initial';
                        result['mask-position'] = 'initial';
                        break;
                    }

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
    if (!props || typeof props !== "object") return {};

    const result = {};

    const {
        type,
        media,
        resolution = "large",

        // visual modifiers
        overlay,
        "bg-color": color,
        opacity,
        scale,
        fade,
        fixed,

        // background css
        "background-size": backgroundSize,
        "background-position": backgroundPosition,
        "background-origin": backgroundOrigin,
        "background-repeat": backgroundRepeat,
        "background-blend-mode": backgroundBlendMode,

        // mask
        "mask-image": maskImage,
        "mask-size": maskSize,
        "mask-origin": maskOrigin,

        // dimensions
        width,
        height,
        "max-height": maxHeight,
        "min-height": minHeight,
        top,
        right,
        bottom,
        left,
    } = props;

    const mediaObj = media || null;

    if (
        type === "none"
    ) {
        result["--bg-display"] = "none";
        result["--image"] = "none";
        result["--video"] = "none";
        result["--color"] = "unset";
        result["--mask-image"] = "unset";

        return result;
    }

    /* ------------------------------------------------------------
     * IMAGE / FEATURED IMAGE
     * ------------------------------------------------------------ */
    if (
        type === "image" ||
        type === "featured-image" ||
        type === "featured-image-mobile"
    ) {
        if (mediaObj?.isPlaceholder || mediaObj?.source === "#") {
            result["--image"] = "#";
        } else if (mediaObj?.source) {
            result["--video"] = "none";
            const resolved = getImageUrlForResolution(mediaObj, resolution);
            if (resolved) {
                result["--image"] = buildImageSet(resolved);
            }
        }

        if (type === "featured-image") {
            result["--featured-image"] = "true";
        }

        if (type === "featured-image-mobile") {
            result["--featured-image-mobile"] = "true";
        }
    }

    /* ------------------------------------------------------------
     * VIDEO
     * ------------------------------------------------------------ */
    if (type === "video" && mediaObj && !mediaObj.isPlaceholder) {
        result["--video"] = "flex";
    }

    /* ------------------------------------------------------------
     * BACKGROUND CORE PROPS
     * ------------------------------------------------------------ */
    if (backgroundSize != null) {
        result["--size"] = backgroundSize;
    }

    if (backgroundOrigin != null) {
        result["--origin"] = backgroundOrigin;
    }

    if (backgroundRepeat != null) {
        result["--repeat"] = backgroundRepeat;
    }

    if (backgroundBlendMode != null) {
        result["--blend"] = backgroundBlendMode;
    }

    /* ------------------------------------------------------------
     * BACKGROUND POSITION → TOP / RIGHT / BOTTOM / LEFT
     * ------------------------------------------------------------ */
    if (backgroundPosition != null && backgroundPosition !== "") {
        const pos = String(backgroundPosition).toLowerCase();

        // Default: centered
        let inset = {
            top: "50%",
            right: "auto",
            bottom: "auto",
            left: "50%",
        };

        if (pos.includes("top")) {
            inset = {
                top: "0",
                right: "0",
                bottom: "auto",
                left: "0",
            };
        }

        if (pos.includes("bottom")) {
            inset = {
                top: "auto",
                right: "0",
                bottom: "0",
                left: "0",
            };
        }

        if (pos.includes("left")) {
            inset = {
                top: "0",
                right: "auto",
                bottom: "0",
                left: "0",
            };
        }

        if (pos.includes("right")) {
            inset = {
                top: "0",
                right: "0",
                bottom: "0",
                left: "auto",
            };
        }

        // Apply atomically
        result["--top"] = inset.top;
        result["--right"] = inset.right;
        result["--bottom"] = inset.bottom;
        result["--left"] = inset.left;
    }

    /* ------------------------------------------------------------
 * MASK
 * ------------------------------------------------------------ */
    if (maskImage?.isPlaceholder || maskImage?.source === "#") {
        result["--mask-image"] = "none";
        result["--mask-repeat"] = "initial";
        result["--mask-size"] = "initial";
        result["--mask-origin"] = "initial";
    } else if (maskImage) {
        const url =
            typeof maskImage === "object"
                ? maskImage.source
                : maskImage;

        if (url) {
            result["--mask-image"] = `url("${url}")`;
            result["--mask-repeat"] = "no-repeat";
            result["--mask-size"] = maskSize || "contain";
            result["--mask-origin"] = maskOrigin || "center";
        }
    }


    /* ------------------------------------------------------------
     * VISUAL MODIFIERS
     * ------------------------------------------------------------ */
    if (opacity != null) {
        const n = parseFloat(opacity);
        if (!isNaN(n)) {
            result["--opacity"] = n > 1 ? n / 100 : n;
        }
    }

    if (scale != null) {
        const s = parseFloat(scale);
        if (!isNaN(s)) {
            result["--scale"] = `${s}%`;
        }
    }

    if (fade != null) {
        result["--fade"] = fade;
    }

    if (overlay != null) {
        result["--overlay"] = overlay;
    }

    if (color != null) {
        result["--color"] = color;
    }

    /* ------------------------------------------------------------
     * DIMENSIONS (append % where appropriate)
     * ------------------------------------------------------------ */
    if (width != null && width !== "") {
        result["--width"] =
            typeof width === "number" || /^\d+$/.test(width)
                ? `${width}%`
                : width;
    }

    if (height != null && height !== "") {
        result["--height"] =
            typeof height === "number" || /^\d+$/.test(height)
                ? `${height}%`
                : height;
    }

    if (maxHeight != null) {
        result["--max-height"] = maxHeight;
    }

    if (minHeight != null) {
        result["--min-height"] = minHeight;
    }

    /* ------------------------------------------------------------
     * EXPLICIT POSITION OVERRIDES (win last)
     * ------------------------------------------------------------ */
    if (top != null) result["--top"] = top;
    if (right != null) result["--right"] = right;
    if (bottom != null) result["--bottom"] = bottom;
    if (left != null) result["--left"] = left;

    /* ------------------------------------------------------------
     * ATTACHMENT
     * ------------------------------------------------------------ */
    if (fixed) {
        result["--attachment"] = "fixed";
    } else if (type === "image" && mediaObj?.source) {
        result["--attachment"] = "scroll";
    }

    return result;
}

function buildPreloadArray({blockItems = [], incoming = [], current = []} = {}) {
    const safeBlock = Array.isArray(blockItems) ? blockItems : [];
    const safeIncoming = Array.isArray(incoming) ? incoming : [];
    const safeCurrent = Array.isArray(current) ? current : [];

    const cleanIncoming = safeIncoming
        .map(normalizePreloadItem)
        .filter(Boolean);

    const cleanBlock = safeBlock
        .map(normalizePreloadItem)
        .filter(Boolean);

    const combined = [...cleanBlock, ...cleanIncoming];

    const seen = new Set();
    const deduped = [];

    const buildKey = (x) =>
        `${x.id}|${x.resolution || ''}|${x.media || ''}|${x.type || ''}`;

    for (const item of combined) {
        const key = buildKey(item);
        if (!seen.has(key)) {
            seen.add(key);
            deduped.push(item);
        }
    }

    return _.isEqual(safeCurrent, deduped) ? safeCurrent : deduped;
}

function buildCssTextFromObject(cssObj = {}, props = {}, bpMin = false) {
    if (!props) return "";
    const mq = bpMin ? 'min-width' : 'max-width'

    const {attributes, name} = props;
    if (!attributes) return "";

    const uniqueId = attributes.uniqueId;
    const blockName = name ? name.replace("/", "-") : null;
    if (!uniqueId || !blockName) return "";

    let css = "";
    const selector = `.${blockName}.${uniqueId}`;

    const buildRules = (obj = {}, important = false) =>
        Object.entries(obj)
            .filter(([_, v]) => v != null && v !== "")
            .map(([k, v]) => `${k}:${v}${important ? " !important" : ""};`)
            .join("");

    /* ----------------------------------------------
     * BASE PROPS (layout)
     * ---------------------------------------------- */
    if (!_.isEmpty(cssObj.props)) {
        css += `${selector}{${buildRules(cssObj.props)}}`;
    }

    /* ----------------------------------------------
     * BASE BACKGROUND
     * ---------------------------------------------- */
    if (!_.isEmpty(cssObj.background)) {
        const bgSelector = `${selector} > .wpbs-background`;
        css += `${bgSelector}{${buildRules(cssObj.background)}}`;
    }

    /* ----------------------------------------------
     * BASE HOVER
     * ---------------------------------------------- */
    if (!_.isEmpty(cssObj.hover)) {
        css += `${selector}:hover{${buildRules(cssObj.hover, true)}}`;
    }

    /* ----------------------------------------------
     * BREAKPOINTS
     * ---------------------------------------------- */
    const bps = WPBS?.settings?.breakpoints || {};

    Object.entries(cssObj.breakpoints || {}).forEach(([bpKey, bpCss]) => {
        const bp = bps[bpKey];
        if (!bp) return;

        const maxWidth = bp.size - 1;

        /* ---------------------------
         * BREAKPOINT LAYOUT PROPS
         * --------------------------- */
        if (!_.isEmpty(bpCss.props)) {
            css += `
                @media (${mq}:${maxWidth}px){
                    ${selector}{
                        ${buildRules(bpCss.props, true)}
                    }
                }
            `;
        }

        /* ---------------------------
         * BREAKPOINT BACKGROUND PROPS
         * --------------------------- */
        if (!_.isEmpty(bpCss.background)) {
            const bgSelector = `${selector} > .wpbs-background`;

            css += `
                @media (${mq}:${maxWidth}px){
                    ${bgSelector}{
                        ${buildRules(bpCss.background, true)}
                    }
                }
            `;
        }

        /* ---------------------------
         * BREAKPOINT HOVER
         * --------------------------- */
        if (!_.isEmpty(bpCss.hover)) {
            css += `
                @media (${mq}:${maxWidth}px){
                    ${selector}:hover{
                        ${buildRules(bpCss.hover, true)}
                    }
                }
            `;
        }
    });

    return css;
}

function onStyleChange({css = {}, preload = [], props, styleRef, bpMin = false}) {

    if (!props) return;

    const {clientId, name, attributes} = props;
    if (!clientId || !attributes) return;

    const blockName = name ? name.replace('/', '-') : null;
    const uniqueId = attributes.uniqueId;
    if (!blockName || !uniqueId) return;

    const layout = attributes['wpbs-style'] || {};
    const prevPreload = attributes['wpbs-preload'] || [];
    const blockStyle = attributes.style || {};

    const bgData = attributes["wpbs-background"] || {};
    const baseBgProps = bgData.props || {};
    const bpBgMap = bgData.breakpoints || {};

    const cleanedLayout = cleanObject(layout, true);

    let cssObj = {
        props: parseSpecialProps(cleanedLayout.props || {}, attributes),
        background: parseBackgroundProps(baseBgProps),
        hover: {},
        breakpoints: {},
    };

    // --------------------------------------------
    // Gap from core block spacing (blockGap)
    // --------------------------------------------
    const gap = blockStyle?.spacing?.blockGap;
    if (gap) {
        const rowGapVal = gap?.top ?? (typeof gap === "string" ? gap : undefined);
        const colGapVal = gap?.left ?? (typeof gap === "string" ? gap : undefined);

        if (rowGapVal) {
            const g = getCSSFromStyle(rowGapVal);
            cssObj.props["--row-gap"] = g;
            cssObj.props["row-gap"] = g;
        }
        if (colGapVal) {
            const g = getCSSFromStyle(colGapVal);
            cssObj.props["--column-gap"] = g;
            cssObj.props["column-gap"] = g;
        }
    }

    // --------------------------------------------
    // 1) LAYOUT BREAKPOINTS (props + hover)
    // --------------------------------------------
    const layoutBpMap = cleanedLayout.breakpoints || {};

    Object.entries(layoutBpMap).forEach(([bpKey, bpLayout]) => {
        const bpCss = cssObj.breakpoints[bpKey] || {
            props: {},
            background: {},
            hover: {},
        };

        // Props: inherit → override → diff
        const baseProps = cssObj.props || {};
        const mergedProps = bpLayout.props
            ? {...baseProps, ...parseSpecialProps(bpLayout.props, attributes)}
            : baseProps;

        const diffPropsObj = diffObjects(baseProps, mergedProps);
        if (!_.isEmpty(diffPropsObj)) {
            bpCss.props = diffPropsObj;
        }

        // Hover
        if (bpLayout.hover) {
            bpCss.hover = parseSpecialProps(bpLayout.hover, attributes);
        }

        cssObj.breakpoints[bpKey] = bpCss;
    });

    // --------------------------------------------
    // 2) BACKGROUND BREAKPOINTS (background only)
    // --------------------------------------------
    Object.entries(bpBgMap || {}).forEach(([bpKey, bpValue]) => {
        const rawBpBg = bpValue?.props || {};
        let effectiveBpBg = {...rawBpBg};

        // Inherit base media when only resolution is changed
        if (
            effectiveBpBg.resolution &&
            !effectiveBpBg.media &&
            !effectiveBpBg.image
        ) {
            effectiveBpBg.media =
                baseBgProps.media || baseBgProps.image || null;
        }

        if (Object.keys(effectiveBpBg).length === 0) {
            return;
        }

        const parsedBase = parseBackgroundProps(baseBgProps);
        const parsedBp = parseBackgroundProps(effectiveBpBg);

        const diffBgObj = diffObjects(parsedBase, parsedBp);
        if (_.isEmpty(diffBgObj)) {
            return;
        }

        const bpCss = cssObj.breakpoints[bpKey] || {
            props: {},
            background: {},
            hover: {},
        };

        bpCss.background = diffBgObj;
        cssObj.breakpoints[bpKey] = bpCss;
    });

    // --------------------------------------------
    // Base hover (non-breakpoint)
    // --------------------------------------------
    if (cleanedLayout.hover) {
        cssObj.hover = parseSpecialProps(cleanedLayout.hover, attributes);
    }

    // External CSS overrides (if any)
    cssObj = _.merge({}, cssObj, css || {});

    const cleanedCss = cleanObject(cssObj, true);

    const incoming = extractPreloadsFromLayout(bgData, uniqueId);
    const nextPreload = buildPreloadArray({
        blockItems: preload,
        incoming,
        current: prevPreload,
    });

    const cssText = buildCssTextFromObject(cleanedCss, props, bpMin);
    if (styleRef?.current) {
        styleRef.current.textContent = cssText;
    }

    const sameCss = cleanedCss && _.isEqual(cleanObject(props?.attributes?.['wpbs-css'] ?? {}, true), cleanObject(cleanedCss, true));

    if (sameCss) {
        return;
    }

    if (!!bpMin) {
        //cleanedCss.__bpMin = true;
    }

    const {dispatch} = wp.data;
    dispatch("core/block-editor").updateBlockAttributes(clientId, {
        "wpbs-css": cleanedCss,
        "wpbs-preload": nextPreload,
    });
}

export function initStyleEditor() {
    if (window.WPBS_StyleEditor) return window.WPBS_StyleEditor;

    const identityStore = new Map();

    function registerBlock(uniqueId, clientId) {
        // No uniqueId yet → fresh block
        if (!uniqueId) {
            return "fresh";
        }

        let owners = identityStore.get(uniqueId);

        // First time we've seen this ID
        if (!owners) {
            owners = new Set();
            identityStore.set(uniqueId, owners);
        }

        // No owners yet → this clientId becomes the owner
        if (owners.size === 0) {
            owners.add(clientId);
            return "fresh";
        }

        // Already owned by this block
        if (owners.has(clientId)) {
            return "normal";
        }

        // Another block owns this ID → collision
        return "clone";
    }

    function unregisterBlock(uniqueId, clientId) {
        if (!uniqueId) return;

        const owners = identityStore.get(uniqueId);
        if (!owners) return;

        owners.delete(clientId);

        if (owners.size === 0) {
            identityStore.delete(uniqueId);
        }
    }


    const api = {
        layoutFieldsMap,
        hoverFieldsMap,
        backgroundFieldsMap,
        cleanObject,
        onStyleChange,
        registerBlock,
        unregisterBlock,
        updateEditorIcons,
    };

    window.WPBS_StyleEditor = api;
    return api;
}