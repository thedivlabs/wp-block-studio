import './scss/block.scss'

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {FigureInspector} from './controls';
import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from 'Components/Style';
import {useCallback, useEffect, useMemo} from "@wordpress/element";
import ResponsivePicture from "Components/ResponsivePicture";
import {getAnchorProps} from "Components/Link";
import {cleanObject} from "Includes/helper";

const selector = "wpbs-figure";

const getClassNames = (attributes = {}, styleData) => {
    const { "wpbs-figure": raw = {} } = attributes;

    const base = raw.props || {};
    const breakpoints = raw.breakpoints || {};
    const bpList = Object.values(breakpoints).map(bp => bp?.props || {});

    // Utility: read a prop from base OR any breakpoint override
    const anyProp = (key) => {
        if (base[key]) return true;
        for (const bp of bpList) {
            if (bp[key]) return true;
        }
        return false;
    };

    // Utility: detect real image
    const isRealImage = (img) => {
        if (!img || img.isPlaceholder) return false;
        if (img.id) return true;
        if (img.source && img.source !== "#") return true;
        return false;
    };

    // Detect any image at any level
    const hasAnyImage = (() => {
        if (isRealImage(base.image)) return true;
        for (const bp of bpList) {
            if (isRealImage(bp.image)) return true;
        }
        return false;
    })();

    // Featured-image types are never empty
    const isFeatured =
        base.type === "featured-image" ||
        base.type === "featured-image-mobile";

    const isEmpty = !hasAnyImage && !isFeatured;

    return [
        selector,
        "h-fit w-fit max-w-full max-h-full flex",

        anyProp("contain") ? "--contain" : null,
        anyProp("blend") ? "--blend" : null,
        anyProp("overlay") ? "--overlay" : null,
        anyProp("origin") ? "--origin" : null,

        isEmpty ? "--empty" : null,

        attributes.uniqueId ?? "",
    ]
        .filter(Boolean)
        .join(" ");
};

function renderFigureContent(settings, attributes, mode = "edit") {
    const type = settings?.props?.type || "image";
    const baseProps = settings?.props || {};
    const bpMap = settings?.breakpoints || {};

    // Link wrapper — uses new baseProps.link
    const wrapWithLink = (content) => {
        const link = baseProps.link;
        if (!link) return content;

        return mode === "save"
            ? <a {...getAnchorProps(link)}>{content}</a>
            : <a>{content}</a>;
    };

    // Unified settings passed to ResponsivePicture
    const pictureSettings = {
        props: baseProps,
        breakpoints: bpMap,
    };

    // --------------------------------------
    // TYPE: IMAGE (dynamic responsive)
    // --------------------------------------
    if (type === "image" || type === "featured-image") {
        return wrapWithLink(
            <ResponsivePicture
                settings={pictureSettings}
                editor={mode === "edit"}
            />
        );
    }

    // --------------------------------------
    // TYPE: FEATURED IMAGE (save mode)
    // --------------------------------------
    if (type === "featured-image" && mode === "save") {
        const payload = {
            isMobile: false,
            resolution: baseProps.resolution,
        };

        const encoded = btoa(JSON.stringify(payload));

        const featuredSettings = {
            props: {
                ...baseProps,
                image: {
                    isPlaceholder: true,
                    source: `%%_FEATURED_JSON_${encoded}%%`,  // <-- encoded JSON placeholder
                    alt: "%%_FEATURED_ALT_%%",                // still handled separately
                }
            },
            breakpoints: bpMap,
        };

        return wrapWithLink(
            <ResponsivePicture
                settings={featuredSettings}
                editor={false}
            />
        );
    }

    // --------------------------------------
    // TYPE: FEATURED IMAGE MOBILE
    // --------------------------------------
    if (type === "featured-image-mobile") {
        const payload = {
            isMobile: true,
            resolution: props.resolution,
        };

        const encoded = btoa(JSON.stringify(payload));

        const mobileSettings = {
            props: {
                ...baseProps,
                image: {
                    isPlaceholder: true,
                    source: `%%_FEATURED_JSON_${encoded}%%`,
                    alt: "%%_FEATURED_ALT_%%",
                },
            },
            breakpoints: bpMap,
        };

        return wrapWithLink(
            <ResponsivePicture
                settings={mobileSettings}
                editor={mode === "edit"}
            />
        );
    }


    // --------------------------------------
    // LOTTIE
    // --------------------------------------
    if (type === "lottie") {
        const lottieSrc = baseProps?.lottieFile?.url || null;

        return wrapWithLink(
            <div
                class="wpbs-lottie"
                data-src={lottieSrc}
                aria-hidden="true"
            />
        );
    }

    return null;
}

registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        "wpbs-figure": {
            type: "object",
            default: {},
        },
    },

    edit: withStyle(
        (props) => {

            const {attributes, styleData, BlockWrapper, setCss, setPreload, setAttributes} = props;

            const {'wpbs-figure': settings = {}} = attributes;

            const classNames = getClassNames(attributes, styleData);

            const cssObj = useMemo(() => {
                const type = settings?.type ?? null;
                const overlay = settings?.overlay ?? null;
                const origin = settings?.origin ?? null;
                const blend = settings?.blend ?? null;

                // Single breakpoint key (e.g. "sm", "md", "normal")
                const bpKey = settings?.breakpoint || 'normal';


                return cleanObject({
                    props: {
                        "--overlay": overlay,
                        "--origin": origin,
                        "--blend": blend,
                    },
                    breakpoints: {
                        sm: {
                            props: {
                                '--testing': 'Chat GPT'
                            }
                        }
                    },
                });
            }, [settings]);

            const preloadObj = useMemo(() => {
                const eager = !!settings?.eager;
                if (!eager) return [];

                const group = attributes?.uniqueId || null;
                if (!group) return [];

                const bpKey = attributes?.breakpoint || null; // e.g. "sm"

                const large = settings?.imageLarge;
                const mobile = settings?.imageMobile;

                const result = [];

                // 1. BASE preload — large image (NO breakpoint key)
                if (large?.id) {
                    result.push({
                        id: large.id,
                        type: "image",
                        group,
                    });
                }

                // 2. BREAKPOINT preload — mobile image (WITH breakpoint key)
                if (bpKey && mobile?.id) {
                    result.push({
                        id: mobile.id,
                        type: "image",
                        group,
                        breakpoint: bpKey,
                    });
                }

                return result;
            }, [settings, attributes?.uniqueId, attributes?.breakpoint]);

            useEffect(() => setPreload(preloadObj), [preloadObj]);

            useEffect(() => setCss(cssObj), [cssObj]);

            const updateSettings = useCallback((newValue) => {

                const result = {
                    ...settings,
                    ...newValue,
                };

                setAttributes({
                    'wpbs-figure': result
                });
            }, [setAttributes, settings]);

            const inspectorPanel = useMemo(() => <FigureInspector attributes={attributes}
                                                                  updateSettings={updateSettings}/>, [settings]);


            return (
                <>
                    {inspectorPanel}

                    <BlockWrapper
                        props={props}
                        className={classNames}
                        hasBackground={true}
                        tagName="figure"
                    >
                        {renderFigureContent(settings, attributes, "edit")}
                    </BlockWrapper>
                </>
            );

        }),

    save: withStyleSave((props) => {
        const {attributes, styleData, BlockWrapper} = props;
        const settings = attributes["wpbs-figure"] || {};
        const classNames = getClassNames(attributes, styleData);

        return (
            <BlockWrapper
                props={props}
                className={classNames}
                hasBackground={true}
                tagName="figure"
            >
                {renderFigureContent(settings, attributes, "save")}
            </BlockWrapper>
        );
    }),


});
