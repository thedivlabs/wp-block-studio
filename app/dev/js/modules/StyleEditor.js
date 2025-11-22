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
                        result['--column-gap'] = left;
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
        const resolved = getImageUrlForResolution(image, resolution || "large");
        result["--image"] = buildImageSet(resolved);
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

function buildPreloadArray({blockItems = [], incoming = [], current = []} = {}) {
    const safeBlock = Array.isArray(blockItems) ? blockItems : [];
    const safeIncoming = Array.isArray(incoming) ? incoming : [];
    const safeCurrent = Array.isArray(current) ? current : [];

    // Normalize + remove nulls
    const cleanIncoming = safeIncoming
        .map(normalizePreloadItem)
        .filter(Boolean);

    const cleanBlock = safeBlock
        .map(normalizePreloadItem)
        .filter(Boolean);

    const combined = [...cleanBlock, ...cleanIncoming];

    // Dedupe
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

    // If nothing changed, return the original array to avoid churn
    return _.isEqual(safeCurrent, deduped) ? safeCurrent : deduped;
}

function buildCssTextFromObject(cssObj = {}, props = {}) {
    if (!props) return "";

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

    // Base props
    if (!_.isEmpty(cssObj.props)) {
        css += `${selector}{${buildRules(cssObj.props)}}`;
    }

    // Background
    if (!_.isEmpty(cssObj.background)) {
        const bgSelector = `${selector} > .wpbs-background`;
        css += `${bgSelector}{${buildRules(cssObj.background)}}`;
    }

    // Hover
    if (!_.isEmpty(cssObj.hover)) {
        css += `${selector}:hover{${buildRules(cssObj.hover, true)}}`;
    }

    // Breakpoints
    const bps = WPBS?.settings?.breakpoints || {};
    Object.entries(cssObj.breakpoints || {}).forEach(([bpKey, bpProps]) => {
        const bp = bps[bpKey];
        if (!bp) return;

        const mergedBp = {
            ...(bpProps.props || {}),
            ...(bpProps.custom || {}),
            ...(bpProps.background || {}),
        };

        if (!_.isEmpty(mergedBp)) {
            css += `
                @media (max-width:${bp.size - 1}px){
                    ${selector}{
                        ${buildRules(mergedBp, true)}
                    }
                }
            `;
        }
    });

    return css;
}

function onStyleChange({css = {}, preload = [], props, styleRef}) {
    if (!props) return;

    const {clientId, name, attributes} = props;
    if (!clientId || !attributes) return;

    // block identity
    const blockName = name ? name.replace('/', '-') : null;
    const uniqueId = attributes.uniqueId;
    if (!blockName || !uniqueId) return;

    // layout + stored css
    const layout = attributes['wpbs-style'] || {};
    const prevPreload = attributes['wpbs-preload'] || [];
    const blockStyle = attributes.style || {};

    // ----------------------------------------
    // 2. Clean layout
    // ----------------------------------------
    const cleanedLayout = cleanObject(layout, true);

    // ----------------------------------------
    // 3. Base CSS from layout
    // ----------------------------------------
    let cssObj = {
        props: parseSpecialProps(cleanedLayout.props || {}, attributes),
        background: parseBackgroundProps(cleanedLayout.background || {}),
        hover: {},
        breakpoints: {},
    };

    // ----------------------------------------
    // 4. Gaps
    // ----------------------------------------
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

    // ----------------------------------------
    // 5. Breakpoints (inherit + overrides)
    // ----------------------------------------

    Object.entries(cleanedLayout.breakpoints || {}).forEach(([bpKey, bpProps]) => {
        const bpCss = {
            props: {},
            background: {}
        };

        // ----------------------------------------
        // PROPS: inherit → override → diff
        // ----------------------------------------
        const baseProps = cssObj.props || {};
        const mergedProps = bpProps?.props
            ? { ...baseProps, ...parseSpecialProps(bpProps.props, attributes) }
            : baseProps;

        const diffPropsObj = diffObjects(baseProps, mergedProps);
        if (!_.isEmpty(diffPropsObj)) {
            bpCss.props = diffPropsObj;
        }

        // ----------------------------------------
        // BACKGROUND: NO automatic inheritance.
        // Only compute vars for what the user explicitly changed.
        // ----------------------------------------

        const baseBg = cleanedLayout.background || {};
        const rawBpBg = bpProps?.background || {};

        // If user overrides only resolution, inherit base image safely
        let effectiveBpBg = { ...rawBpBg };
        if (effectiveBpBg.resolution && !effectiveBpBg.image) {
            effectiveBpBg.image = baseBg.image;
        }

        // If nothing changed, output nothing
        if (Object.keys(effectiveBpBg).length > 0) {
            // parseBackgroundProps returns full var set, so we diff against base
            const parsedBase = parseBackgroundProps(baseBg);
            const parsedBp   = parseBackgroundProps(effectiveBpBg);

            const diffBgObj = diffObjects(parsedBase, parsedBp);
            if (!_.isEmpty(diffBgObj)) {
                bpCss.background = diffBgObj;
            }
        }

        // Save simplified diff object
        cssObj.breakpoints[bpKey] = bpCss;
    });


    // ----------------------------------------
    // 6. Hover
    // ----------------------------------------
    if (cleanedLayout.hover) {
        cssObj.hover = parseSpecialProps(cleanedLayout.hover, attributes);
    }

    // ----------------------------------------
    // 7. Merge block-level CSS from ref
    // ----------------------------------------
    cssObj = _.merge({}, cssObj, css || {});

    // ----------------------------------------
    // 8. Clean final CSS object
    // ----------------------------------------
    const cleanedCss = cleanObject(cssObj, true);

    // ----------------------------------------
    // 9. Preload merging
    // ----------------------------------------
    const incoming = extractPreloadsFromLayout(cleanedLayout, uniqueId);
    const nextPreload = buildPreloadArray({
        blockItems: preload,
        incoming,
        current: prevPreload,
    });

    const cssText = buildCssTextFromObject(cleanedCss, props);
    if (styleRef?.current) {
        styleRef.current.textContent = cssText;
    }

    const sameCss = _.isEqual(attributes["wpbs-css"], cleanedCss);
    const samePreload = _.isEqual(attributes["wpbs-preload"], nextPreload);

    if (sameCss && samePreload) {
        return; // nothing changed, do not dirty the block
    }


    // ----------------------------------------
    // 12. Persist css + preload
    // ----------------------------------------
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
        // Fresh block: no ID assigned yet
        if (!uniqueId) {
            return "fresh";
        }

        // First time this uniqueId is seen
        if (!identityStore.has(uniqueId)) {
            identityStore.set(uniqueId, new Set([clientId]));
            return "normal";
        }

        const clients = identityStore.get(uniqueId);

        // If this clientId already recorded, normal load / re-render
        if (clients.has(clientId)) {
            return "normal";
        }

        // Another clientId already exists → this is a clone
        if (clients.size >= 1) {
            clients.add(clientId);
            return "clone";
        }

        // Fallback: treat as normal
        clients.add(clientId);
        return "normal";
    }

    function unregisterBlock(uniqueId, clientId) {
        if (!uniqueId) return;

        const clients = identityStore.get(uniqueId);
        if (!clients) return;

        clients.delete(clientId);

        // Clean empty sets
        if (clients.size === 0) {
            identityStore.delete(uniqueId);
        }
    }


    const api = {
        layoutFieldsMap,
        hoverFieldsMap,
        backgroundFieldsMap,
        cleanObject,
        getCSSFromStyle,
        onStyleChange,
        buildPreloadArray,

        // NEW identity helpers
        registerBlock,
        unregisterBlock,
    };

    window.WPBS_StyleEditor = api;
    return api;
}



