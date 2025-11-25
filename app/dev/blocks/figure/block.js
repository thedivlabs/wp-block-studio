import './scss/block.scss'

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {FigureInspector} from './controls';
import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from 'Components/Style';
import {useCallback, useEffect, useMemo} from "@wordpress/element";
import ResponsivePicture from "Components/ResponsivePicture";
import {getAnchorProps} from "Components/Link";
import {cleanObject} from "Includes/helper";
import {
    getBreakpointPropsList,
    anyProp,
    isRealImage,
    hasAnyImage,
    isFeaturedType
} from "./utils";

const selector = "wpbs-figure";

const getClassNames = (attributes = {}, styleData) => {
    const raw = attributes["wpbs-figure"] || {};
    const base = raw.props || {};

    const bpPropsList = getBreakpointPropsList(raw);

    // Detect image presence across all props + breakpoints
    const hasImage = hasAnyImage(base, bpPropsList);

    // Featured-image types always count as "has something"
    const featured = isFeaturedType(base.type);

    const isEmpty = !hasImage && !featured;

    return [
        selector,
        "h-fit w-fit max-w-full max-h-full flex",

        anyProp(base, bpPropsList, "contain") ? "--contain" : null,
        anyProp(base, bpPropsList, "blend") ? "--blend" : null,
        anyProp(base, bpPropsList, "overlay") ? "--overlay" : null,
        anyProp(base, bpPropsList, "origin") ? "--origin" : null,

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
