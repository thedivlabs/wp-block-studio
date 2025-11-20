import './scss/block.scss'

import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {FigureInspector} from './controls';
import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from 'Components/Style';
import {useCallback, useEffect, useMemo} from "@wordpress/element";
import ResponsivePicture from "Components/ResponsivePicture";
import {getAnchorProps} from "Components/Link";

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
        return settings?.link
            ? <a class="wpbs-layout-wrapper" {...getAnchorProps(settings.link)}>{content}</a>
            : content;
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
        // edit mode: still show ResponsivePicture
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

        // save mode: output plain img tag replaced via PHP
        return wrapWithLink(
            <img
                src="#FEATURED_LARGE#"
                alt="#FEATURED_ALT#"
                class="wpbs-picture-featured"
                loading={settings?.eager ? "eager" : "lazy"}
                aria-hidden="true"
            />
        );
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
                const width = settings?.["element-width"] ?? null;
                const height = settings?.["element-height"] ?? null;

                // Raw URLs
                const largeURL = settings?.imageLarge?.url || null;
                const mobileURL = settings?.imageMobile?.url || null;

                // Single breakpoint key (e.g. "sm", "md", "normal")
                const bpKey = settings?.breakpoint || null;

                const breakpoints = {
                    // If a breakpoint + mobile image is set,
                    // override the figure image there.
                    ...(bpKey && mobileURL
                        ? {
                            [bpKey]: {
                                "--figure-image": mobileURL,
                            },
                        }
                        : {}),
                };

                return {
                    props: {
                        "--figure-type": type,
                        "--overlay": overlay,
                        "--origin": origin,
                        "--element-width": width,
                        "--element-height": height,

                        // base image for all viewports
                        "--figure-image": largeURL,
                    },
                    breakpoints,
                };
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
