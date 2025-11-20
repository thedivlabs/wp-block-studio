import {registerBlockType} from "@wordpress/blocks";
import metadata from "./block.json";

import {FigureInspector} from './components/editor';
import {STYLE_ATTRIBUTES, withStyle, withStyleSave} from 'Components/Style';
import {useCallback, useEffect, useMemo} from "@wordpress/element";

const selector = "wpbs-figure";

const getClassNames = (attributes = {}, styleData) => {
    const {"wpbs-figure": settings = {}} = attributes;

    const hasLarge = !!settings?.imageLarge?.id;
    const hasMobile = !!settings?.imageMobile?.id;
    const isEmpty = !hasLarge && !hasMobile && settings?.type !== "featured-image";

    return [
        selector,            // "wpbs-figure"
        "h-full",
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


                return {};
            }, [settings, attributes["wpbs-breakpoint"]]);

            useEffect(() => setCss(cssObj), [cssObj]);

            useEffect(() => setPreload(preloadObj), [preloadObj]);


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
                                                                  updateSettings={updateSettings}/>, []);

            return (
                <>
                    {inspectorPanel}
                    <BlockWrapper
                        props={props}
                        className={classNames}
                        hasBackground={true}
                        tagName="figure"
                    />
                </>
            );
        }),

    save: withStyleSave((props) => {
        const {attributes, styleData, BlockWrapper} = props;
        const classNames = getClassNames(attributes, styleData);

        return (
            <BlockWrapper
                props={props}
                className={classNames}
                hasBackground={true}
                tagName="figure"
            />
        );
    }),
});
