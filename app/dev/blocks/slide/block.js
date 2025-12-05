import "./scss/block.scss";

import { registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";

import { STYLE_ATTRIBUTES, withStyle, withStyleSave } from "Components/Style";
import { useMemo, useCallback, useEffect } from "@wordpress/element";
import { PanelBody, __experimentalGrid as Grid } from "@wordpress/components";
import { InnerBlocks, InspectorControls } from "@wordpress/block-editor";
import { BreakpointPanels } from "Components/BreakpointPanels";
import { Field } from "Components/Field";
import ResponsivePicture from "Components/ResponsivePicture";
import Link, { getAnchorProps } from "Components/Link";
import { resolveFeaturedMedia, cleanObject } from "Includes/helper";
import { isEqual } from "lodash";

// ------------------------
// Slide control fields
// ------------------------
import { ORIGIN_OPTIONS, RESOLUTION_OPTIONS } from "Includes/config";

const IMAGE_FIELDS = [
    { slug: "image", type: "image", label: "Image", full: true },
    { slug: "resolution", type: "select", label: "Size", options: RESOLUTION_OPTIONS },
];

const BASE_FIELDS = [
    ...IMAGE_FIELDS,
    { slug: "origin", type: "select", label: "Origin", options: ORIGIN_OPTIONS },
    { slug: "contain", type: "toggle", label: "Contain" },
    { slug: "eager", type: "toggle", label: "Eager" },
];

const BREAKPOINT_FIELDS = [
    ...IMAGE_FIELDS,
    { slug: "origin", type: "select", label: "Origin", options: ORIGIN_OPTIONS },
    { slug: "contain", type: "toggle", label: "Contain" },
];

// ------------------------
// Normalize settings
// ------------------------
const normalizeSettings = (raw) => {
    if (raw && (raw.props || raw.breakpoints)) {
        return { props: raw.props || {}, breakpoints: raw.breakpoints || {} };
    }
    return { props: raw || {}, breakpoints: {} };
};

// ------------------------
// Slide Inspector
// ------------------------
function SlideInspector({ attributes, updateSettings }) {
    const rawSettings = attributes["wpbs-slide"] || {};
    const value = useMemo(() => normalizeSettings(rawSettings), [rawSettings]);
    const sharedConfig = useMemo(() => ({ isToolsPanel: false }), []);

    // Link control
    const linkControl = useMemo(
        () => (
            <Link
                defaultValue={value?.props?.link}
                callback={(link) =>
                    updateSettings({
                        ...value,
                        props: { ...value.props, link },
                    })
                }
            />
        ),
        [value, updateSettings]
    );

    const handlePanelsChange = useCallback(
        (nextValue) => updateSettings(normalizeSettings(nextValue)),
        [updateSettings]
    );

    const renderFields = useCallback(
        (entry, updateEntry, bpKey) => {
            const settings = entry?.props || {};
            const applyPatch = (patch) =>
                updateEntry({ ...entry, props: { ...entry.props, ...patch } });

            const mainFields = ["image", "resolution", "origin"];
            const toggleFields = bpKey ? ["contain"] : ["contain", "eager"];

            return (
                <Grid columns={1} rowGap={20} style={{ padding: 12 }}>
                    {/* First grid: main fields */}
                    <Grid columns={2} columnGap={15} rowGap={20}>
                        {mainFields.map((slug) => {
                            const field = (BASE_FIELDS.concat(BREAKPOINT_FIELDS)).find((f) => f.slug === slug);
                            return <Field key={slug} field={field} settings={settings} callback={applyPatch} {...sharedConfig} />;
                        })}
                    </Grid>

                    {/* Second grid: toggles */}
                    <Grid columns={2} columnGap={15} rowGap={20}>
                        {toggleFields.map((slug) => {
                            const field = (BASE_FIELDS.concat(BREAKPOINT_FIELDS)).find((f) => f.slug === slug);
                            return <Field key={slug} field={field} settings={settings} callback={applyPatch} {...sharedConfig} />;
                        })}
                    </Grid>
                </Grid>
            );
        },
        [sharedConfig]
    );

    const renderBase = useCallback(({ entry, update }) => renderFields(entry, update, false), [renderFields]);
    const renderBreakpoints = useCallback(({ entry, update, bpKey }) => renderFields(entry, update, bpKey), [renderFields]);

    return (
        <InspectorControls group="styles">
            {linkControl}
            <PanelBody initialOpen={false} className="wpbs-block-controls is-style-unstyled" title="Slide">
                <BreakpointPanels
                    value={value}
                    onChange={handlePanelsChange}
                    render={{ base: renderBase, breakpoints: renderBreakpoints }}
                />
            </PanelBody>
        </InspectorControls>
    );
}

// ------------------------
// Get classes
// ------------------------
const getClassNames = (attributes = {}) => ["wpbs-slide", attributes.uniqueId ?? "", "w-full flex"].join(" ");

// ------------------------
// Render slide content
// ------------------------
function renderSlideContent(settings, attributes, isEditor = false) {
    const baseProps = settings.props || {};
    const bpMap = settings.breakpoints || {};

    const wrapWithLink = (content) => {
        const link = baseProps.link;
        if (!link) return content;
        return !isEditor ? <a {...getAnchorProps(link)}>{content}</a> : <a>{content}</a>;
    };

    const finalSettings = { props: { ...baseProps }, breakpoints: {} };

    // Base image
    finalSettings.props.image = resolveFeaturedMedia({
        type: "image",
        media: baseProps.image,
        resolution: (baseProps.resolution || "large").toUpperCase(),
        isEditor,
    });

    // Breakpoint images
    Object.entries(bpMap).forEach(([bpKey, bpEntry]) => {
        const bpProps = bpEntry?.props || {};
        finalSettings.breakpoints[bpKey] = {
            props: {
                ...bpProps,
                image: resolveFeaturedMedia({
                    type: "image",
                    media: bpProps.image || baseProps.image,
                    resolution: (bpProps.resolution || baseProps.resolution || "large").toUpperCase(),
                    isEditor,
                }),
            },
        };
    });

    return wrapWithLink(<ResponsivePicture settings={finalSettings} editor={!!isEditor} />);
}

// ------------------------
// CSS props & preload
// ------------------------
function getCssProps(settings) {
    const baseProps = settings?.props || {};
    const breakpoints = settings?.breakpoints || {};

    const contain = baseProps.contain ? "contain" : null;
    const origin = baseProps.origin ?? null;

    const css = {
        props: {
            "--image-size": contain,
            "--image-origin": origin,
        },
        breakpoints: {},
    };

    Object.entries(breakpoints).forEach(([bpKey, bpEntry]) => {
        const bpProps = bpEntry?.props || {};
        const bpContain = bpProps.contain ? "contain" : null;
        const bpOrigin = bpProps.origin ?? null;

        css.breakpoints[bpKey] = {
            props: {
                "--image-size": bpContain,
                "--image-origin": bpOrigin,
            },
        };
    });

    return cleanObject(css);
}

function getPreload(settings) {
    const preload = [];
    const baseProps = settings?.props || {};
    const breakpoints = settings?.breakpoints || {};

    if (baseProps.eager && baseProps.image?.id && !baseProps.image.isPlaceholder) {
        preload.push({ id: baseProps.image.id, type: "image", resolution: baseProps.resolution || "large" });
    }

    Object.entries(breakpoints).forEach(([bpKey, bpEntry]) => {
        const bpImage = bpEntry?.props?.image;
        if (bpImage?.id && !bpImage.isPlaceholder) {
            preload.push({ id: bpImage.id, type: "image", resolution: bpEntry.props.resolution || "large", breakpoint: bpKey });
        }
    });

    return preload;
}

// ------------------------
// Register Slide block
// ------------------------
registerBlockType(metadata.name, {
    apiVersion: 3,
    attributes: {
        ...metadata.attributes,
        ...STYLE_ATTRIBUTES,
        "wpbs-slide": { type: "object", default: {} },
    },

    edit: withStyle(
        ({ attributes, BlockWrapper, setAttributes, setCss, setPreload }) => {
            const rawSettings = attributes["wpbs-slide"] || {};
            const settings = useMemo(() => normalizeSettings(rawSettings), [rawSettings]);
            const classNames = getClassNames(attributes, settings);

            useEffect(() => {
                setCss(getCssProps(settings));
                setPreload(getPreload(settings));
            }, [settings, setCss, setPreload]);

            const updateSettings = useCallback(
                (nextValue) => {
                    const normalized = normalizeSettings(nextValue);
                    if (!isEqual(settings, normalized)) {
                        setAttributes({ "wpbs-slide": normalized });
                    }
                },
                [settings, setAttributes]
            );

            // Disable InnerBlocks appender if style is image
            const isImageStyle = true; // your condition if you want to check style attribute

            return (
                <>
                    <SlideInspector attributes={attributes} updateSettings={updateSettings} />
                    <BlockWrapper props={{ attributes }} className={classNames}>
                        {renderSlideContent(settings, attributes, true)}
                        <InnerBlocks
                            templateLock={isImageStyle ? "all" : false}
                            renderAppender={isImageStyle ? false : undefined}
                        />
                    </BlockWrapper>
                </>
            );
        },
        { hasChildren: true, hasBackground: true }
    ),

    save: withStyleSave(({ attributes, BlockWrapper }) => {
        const rawSettings = attributes["wpbs-slide"] || {};
        const settings = normalizeSettings(rawSettings);
        const classNames = getClassNames(attributes, settings);

        return (
            <BlockWrapper props={{ attributes }} className={classNames}>
                {renderSlideContent(settings, attributes, false)}
            </BlockWrapper>
        );
    }, { hasChildren: true, hasBackground: true }),
});