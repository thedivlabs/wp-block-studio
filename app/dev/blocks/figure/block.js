import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {FigureInspector} from './components/editor';
import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from 'Components/Style';
import {useCallback, useEffect, useMemo} from "@wordpress/element";
import ResponsivePicture from "Components/ResponsivePicture";

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
                const width = settings?.['element-width'] ?? null;
                const height = settings?.['element-height'] ?? null;

                // Raw URLs
                const largeURL = settings?.imageLarge?.url || null;
                const mobileURL = settings?.imageMobile?.url || null;

                // Breakpoint keys (from block attributes)
                const bp = settings?.breakpoint || {};
                const bpLarge = bp.large || null;   // e.g., "lg"
                const bpMobile = bp.mobile || null; // e.g., "sm"

                return {
                    props: {
                        '--figure-type': type,
                        '--overlay': overlay,
                        '--origin': origin,
                        '--element-width': width,
                        '--element-height': height,

                        // BASE figure image:
                        // Use large image by default (matches WordPress behavior)
                        '--figure-image': largeURL,
                    },

                    breakpoints: {
                        // MOBILE breakpoint override
                        ...(bpMobile && mobileURL
                            ? {
                                [bpMobile]: {
                                    '--figure-image': mobileURL,
                                },
                            }
                            : {}),

                        // LARGE breakpoint override (only if explicitly present)
                        ...(bpLarge && largeURL
                            ? {
                                [bpLarge]: {
                                    '--figure-image': largeURL,
                                },
                            }
                            : {}),
                    },
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
                        <ResponsivePicture
                            mobile={settings?.imageMobile}
                            large={settings?.imageLarge}
                            settings={{
                                resolutionMobile: settings?.resolutionMobile,
                                resolutionLarge: settings?.resolutionLarge,
                                force: settings?.force,
                                eager: settings?.eager,
                                breakpoint: attributes?.breakpoint,
                                className: null,
                                style: null,
                            }}
                            editor={true}
                        />
                    </BlockWrapper>
                </>
            );

        }),

    save: withStyleSave((props) => {
        const {attributes, styleData, BlockWrapper} = props;
        const settings = attributes["wpbs-figure"] || {};
        const classNames = getClassNames(attributes, styleData);

        // --- Determine image URLs or placeholders ---
        const isFeatured = settings?.type === "featured-image";

        // Large + mobile URLs or placeholders
        const largeURL = isFeatured
            ? "#FEATURED_LARGE#"
            : settings?.imageLarge?.url || null;

        const mobileURL = isFeatured
            ? "#FEATURED_MOBILE#"
            : settings?.imageMobile?.url || null;

        // Build a settings object to feed ResponsivePicture
        const pictureSettings = {
            resolutionMobile: settings?.resolutionMobile,
            resolutionLarge: settings?.resolutionLarge,
            force: settings?.force,
            eager: settings?.eager,
            breakpoint: attributes?.breakpoint,
            className: null,
            style: null,
        };

        return (
            <BlockWrapper
                props={props}
                className={classNames}
                hasBackground={true}
                tagName="figure"
            >
                <ResponsivePicture
                    mobile={{...(settings.imageMobile || {}), url: mobileURL}}
                    large={{...(settings.imageLarge || {}), url: largeURL}}
                    settings={pictureSettings}
                    editor={false}
                />
            </BlockWrapper>
        );
    }),

});
