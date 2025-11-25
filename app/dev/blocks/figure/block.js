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
    const {"wpbs-figure": settings = {}} = attributes;

    const hasLarge = !!settings?.imageLarge?.id;
    const hasMobile = !!settings?.imageMobile?.id;
    const isEmpty = !hasLarge && !hasMobile && settings?.type !== "featured-image";

    return [
        selector,            // "wpbs-figure"
        "h-fit w-fit max-w-full max-h-full flex",
        settings.contain ? "--contain" : null,
        settings.blend ? "--blend" : null,
        settings.overlay ? "--overlay" : null,
        settings.origin ? "--origin" : null,
        isEmpty ? "--empty" : null,
        attributes.uniqueId ?? "",
    ]
        .filter(Boolean)
        .join(" ");
};

function renderFigureContent(settings, attributes, mode = "edit") {
    const type = settings?.type || "image";

    // Shared link wrapper
    const wrapWithLink = (content) => {

        if (!settings?.link) {
            return content;
        }

        const isSave = mode === "save";


        return isSave
            ? <a {...getAnchorProps(settings.link)}>{content}</a>
            : <a>{content}</a>;
    };

    // --- 1. RESPONSIVE PICTURE (default image mode) ---
    if (type === "image") {
        const pictureProps = {
            mobile: settings?.imageMobile,
            large: settings?.imageLarge,
            settings: {
                resolutionMobile: settings?.resolutionMobile,
                resolutionLarge: settings?.resolutionLarge,
                force: settings?.force,
                eager: settings?.eager,
                breakpoint: attributes?.breakpoint,
                className: null,
                style: null,
            },
            editor: mode === "edit"
        };

        return wrapWithLink(<ResponsivePicture {...pictureProps} />);
    }

// --- 2. FEATURED IMAGE ---
    if (type === "featured-image") {

        // Edit preview mode (unchanged)
        if (mode === "edit") {
            const pictureProps = {
                mobile: settings?.imageMobile,
                large: settings?.imageLarge,
                settings: {
                    resolutionMobile: settings?.resolutionMobile,
                    resolutionLarge: settings?.resolutionLarge,
                    force: settings?.force,
                    eager: settings?.eager,
                    breakpoint: attributes?.breakpoint,
                    className: null,
                    style: null,
                },
                editor: true
            };

            return wrapWithLink(<ResponsivePicture {...pictureProps} />);
        }

        // -------------------------
        // SAVE MODE (FINAL, CORRECT)
        // -------------------------
        if (mode === "save") {
            const featuredProps = {
                mobile: {
                    isPlaceholder: true,
                    url: "%%_FEATURED_IMAGE_MOBILE_%%",
                    alt: "%%_FEATURED_ALT_%%",
                    id: null,
                },
                large: {
                    isPlaceholder: true,
                    url: "%%_FEATURED_IMAGE_LARGE_%%",
                    alt: "%%_FEATURED_ALT_%%",
                    id: null,
                },
                settings: {
                    resolutionMobile: settings?.resolutionMobile,
                    resolutionLarge: settings?.resolutionLarge,
                    force: settings?.force,
                    eager: settings?.eager,
                    breakpoint: attributes?.breakpoint,
                    className: "wpbs-picture-featured",
                    style: null,
                },
                editor: false
            };

            return wrapWithLink(<ResponsivePicture {...featuredProps} />);
        }
    }


    // --- 3. LOTTIE ---
    if (type === "lottie") {
        const lottieSrc = settings?.lottieFile?.url || null;
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
                            props:{
                                '--testing':'Chat GPT'
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
