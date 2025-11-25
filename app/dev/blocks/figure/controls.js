import {InspectorControls} from "@wordpress/block-editor";
import {useMemo, useCallback} from "@wordpress/element";
import {PanelBody, __experimentalGrid as Grid} from "@wordpress/components";
import {Field} from "Components/Field";
import {BLEND_OPTIONS, ORIGIN_OPTIONS, RESOLUTION_OPTIONS, OVERLAY_GRADIENTS} from "Includes/config";
import Link from "Components/Link";

// MAP #1: image-related settings
const FIGURE_IMAGE_FIELDS = [
    {slug: "image", type: "image", label: "Image", full: true},

    {slug: "resolution", type: "select", label: "Size", options: RESOLUTION_OPTIONS},
];

const FIGURE_SETTING_FIELDS = [
    {slug: "blend", type: "select", label: "Blend", options: BLEND_OPTIONS},
    {slug: "origin", type: "select", label: "Origin", options: ORIGIN_OPTIONS},
    {
        slug: "overlay",
        type: "gradient",
        label: "Overlay",
        full: true,
        gradients: OVERLAY_GRADIENTS,
    },

    {slug: "eager", type: "toggle", label: "Eager"},
    {slug: "contain", type: "toggle", label: "Contain"},
];

const BREAKPOINT_FIGURE_SETTING_FIELDS = [
    {slug: "blend", type: "select", label: "Blend", options: BLEND_OPTIONS},
    {slug: "origin", type: "select", label: "Origin", options: ORIGIN_OPTIONS},
    {
        slug: "overlay",
        type: "gradient",
        label: "Overlay",
        full: true,
        gradients: OVERLAY_GRADIENTS,
    },

    {slug: "contain", type: "toggle", label: "Contain"},
];

import {BreakpointPanels} from "Components/BreakpointPanels";

const TYPE_FIELD = {
    slug: "type",
    type: "select",
    label: "Type",
    options: [
        {label: "Select", value: ""},
        {label: "Image", value: "image"},
        {label: "Featured Image", value: "featured-image"},
        {label: "Featured Image Mobile", value: "featured-image-mobile"},
        {label: "Lottie", value: "lottie"},
        {label: "Icon", value: "icon"},
    ],
    full: true,
};

export function FigureInspector({attributes, updateSettings}) {
    const rawSettings = attributes["wpbs-figure"] || {};

    // Normalize into { props, breakpoints } shape
    const value = useMemo(() => {
        // New structured format
        if (rawSettings && (rawSettings.props || rawSettings.breakpoints)) {
            return {
                props: rawSettings.props || {},
                breakpoints: rawSettings.breakpoints || {},
            };
        }

        // Legacy flat format → treat as base props
        return {
            props: rawSettings,
            breakpoints: {},
        };
    }, [rawSettings]);

    const sharedConfig = useMemo(
        () => ({
            isToolsPanel: false,
        }),
        []
    );

    // Link stays global (non-responsive) as before, using base props
    const LinkControls = useMemo(
        () => (
            <Link
                defaultValue={value?.props?.link}
                callback={(val) =>
                    updateSettings({
                        ...value,
                        props: {
                            ...(value.props || {}),
                            link: val,
                        },
                    })
                }
            />
        ),
        [value, updateSettings]
    );

    const handlePanelsChange = useCallback(
        (nextValue) => {
            const normalized = {
                props: nextValue?.props || {},
                breakpoints: nextValue?.breakpoints || {},
            };

            // Expectation: updateSettings replaces the wpbs-figure object
            updateSettings(normalized);
        },
        [updateSettings]
    );

    // Shared renderer for base + breakpoint panels
    const renderFields = useCallback(
        (entry, updateEntry, bpKey) => {
            const settings = entry?.props || {};

            const applyPatch = (patch) => {
                const nextProps = {
                    ...(entry.props || {}),
                    ...patch,
                };

                updateEntry({
                    ...entry,
                    props: nextProps,
                });
            };

            return (
                <Grid columns={2} columnGap={15} rowGap={20} style={{padding:'16px'}}>
                    {/* TYPE FIELD – standalone */}
                    <Field
                        field={TYPE_FIELD}
                        settings={settings}
                        callback={(val) => applyPatch({type: val})}
                        {...sharedConfig}
                    />

                    {/* MAP #1 — IMAGE + BREAKPOINT + RESOLUTIONS */}
                    {(settings.type === "image" ||
                            settings.type === "featured-image-mobile" ||
                            settings.type === "featured-image") &&
                        FIGURE_IMAGE_FIELDS.map((field) => (
                            <Field
                                key={field.slug}
                                field={field}
                                settings={settings}
                                callback={(val) =>
                                    applyPatch({[field.slug]: val})
                                }
                                {...sharedConfig}
                            />
                        ))}

                    {/* MAP #2 — STYLE + TOGGLES */}
                    {settings.type &&
                        (!!bpKey ? BREAKPOINT_FIGURE_SETTING_FIELDS : FIGURE_SETTING_FIELDS).map((field) => (
                            <Field
                                key={field.slug}
                                field={field}
                                settings={settings}
                                callback={(val) =>
                                    applyPatch({[field.slug]: val})
                                }
                                {...sharedConfig}
                            />
                        ))}
                </Grid>
            );
        },
        [sharedConfig]
    );

    const renderBase = useCallback(
        ({bpKey, entry, update}) => renderFields(entry, update, false),
        [renderFields]
    );

    const renderBreakpoints = useCallback(
        ({bpKey, entry, update}) => renderFields(entry, update, bpKey),
        [renderFields]
    );

    return (
        <>
            {LinkControls}

            <InspectorControls group="styles">
                <PanelBody initialOpen={false} className="wpbs-block-controls is-style-unstyled" title={'Figure'}>
                    <BreakpointPanels
                        value={value}
                        onChange={handlePanelsChange}
                        //label="Figure"
                        render={{
                            base: renderBase,
                            breakpoints: renderBreakpoints,
                        }}
                    />
                </PanelBody>
            </InspectorControls>
        </>
    );
}