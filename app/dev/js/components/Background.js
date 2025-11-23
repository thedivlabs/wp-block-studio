import { memo } from "@wordpress/element";
import {
    __experimentalGrid as Grid,
    __experimentalToolsPanel as ToolsPanel,
    BaseControl,
    GradientPicker,
    PanelBody,
    SelectControl,
    ToggleControl,
} from "@wordpress/components";
import { PanelColorSettings } from "@wordpress/block-editor";
import { Field } from "Components/Field";
import { BreakpointPanels } from "Components/BreakpointPanels";
import { merge } from "lodash";

const BackgroundFields = memo(({ settings, updateFn }) => {
    const { backgroundFieldsMap: map = [] } = window?.WPBS_StyleEditor ?? {};

    return map.map((field) => {
        const callback = (v) => updateFn({ [field.slug]: v });

        return (
            <Field
                key={field.slug}
                field={field}
                settings={settings}
                callback={callback}
            />
        );
    });
});

const BackgroundPanelFields = ({
                                   settings = {},
                                   onChange,
                                   isBreakpoint = false,
                               }) => {
    const hasSettings = settings && Object.keys(settings).length > 0;

    return (
        <Grid columns={1} columnGap={15} rowGap={20}>
            <SelectControl
                __next40pxDefaultSize
                __nextHasNoMarginBottom
                label="Type"
                value={settings?.type ?? ""}
                onChange={(newValue) => {
                    if (newValue === settings?.type) return;

                    onChange({
                        type: newValue,
                        image: {},
                        video: {},
                    });
                }}
                options={[
                    { label: "Select", value: "" },
                    { label: "Image", value: "image" },
                    { label: "Featured Image", value: "featured-image" },
                    { label: "Video", value: "video" },
                ]}
            />

            {!hasSettings ? null : (
                <>
                    {(settings.type === "image" ||
                        settings.type === "featured-image") && (
                        <Field
                            field={{
                                type: "image",
                                slug: "image",
                                label: "Image",
                                full: true,
                            }}
                            settings={settings}
                            callback={(val) => onChange({ image: val })}
                            isToolsPanel={false}
                        />
                    )}

                    {settings.type === "video" && (
                        <Field
                            field={{
                                type: "video",
                                slug: "video",
                                label: "Video",
                                full: true,
                            }}
                            settings={settings}
                            callback={(val) => onChange({ video: val })}
                            isToolsPanel={false}
                        />
                    )}

                    <BaseControl label={"Overlay"}>
                        <div className={"wpbs-background-controls__card"}>
                            <GradientPicker
                                gradients={[
                                    {
                                        name: "Transparent",
                                        gradient:
                                            "linear-gradient(rgba(0,0,0,0),rgba(0,0,0,0))",
                                        slug: "transparent",
                                    },
                                    {
                                        name: "Light",
                                        gradient:
                                            "linear-gradient(rgba(0,0,0,.3),rgba(0,0,0,.3))",
                                        slug: "light",
                                    },
                                    {
                                        name: "Strong",
                                        gradient:
                                            "linear-gradient(rgba(0,0,0,.7),rgba(0,0,0,.7))",
                                        slug: "strong",
                                    },
                                ]}
                                clearable={false}
                                value={settings?.overlay ?? undefined}
                                onChange={(newValue) => onChange({ overlay: newValue })}
                            />
                        </div>
                    </BaseControl>

                    <PanelColorSettings
                        className={"wpbs-controls__color"}
                        enableAlpha
                        colorSettings={[
                            {
                                slug: "color",
                                label: "Color",
                                value: settings?.color ?? undefined,
                                onChange: (newValue) => onChange({ color: newValue }),
                                isShownByDefault: true,
                            },
                        ]}
                        __nextHasNoMarginBottom
                    />

                    <Grid columns={2} columnGap={15} rowGap={20}>
                        {!isBreakpoint && (
                            <ToggleControl
                                label="Eager"
                                checked={!!settings?.eager}
                                onChange={(v) => onChange({ eager: v })}
                            />
                        )}
                        {settings.type !== "video" && (
                            <ToggleControl
                                label="Fixed"
                                checked={!!settings?.fixed}
                                onChange={(v) => onChange({ fixed: v })}
                            />
                        )}
                    </Grid>

                    <div>
                        <ToolsPanel
                            label="Advanced Background"
                            resetAll={() => onChange({}, true)}
                            className={"wpbs-advanced-background"}
                        >
                            <BackgroundFields
                                settings={settings}
                                updateFn={(newProps) => onChange(newProps)}
                            />
                        </ToolsPanel>
                    </div>
                </>
            )}
        </Grid>
    );
};


export const BackgroundControls = ({ settings = {}, callback }) => {

    const value = {
        props: settings?.props || {},
        breakpoints: settings?.breakpoints || {},
    };

    const handleChange = (next = {}) => {
        const { props = {}, breakpoints = {} } = next || {};

        callback({
            props,
            breakpoints,
        });
    };

    const mergeEntryProps = (entry = {}, patch = {}, reset = false) => {
        const currentProps = entry.props || {};
        const baseProps = reset ? {} : currentProps;

        // identical to style editor: deep merge patch into entry.props
        const nextProps = merge({}, baseProps, patch || {});

        return {
            ...entry,
            props: nextProps,
        };
    };

    return (
        <PanelBody
            title="Background"
            initialOpen={hasAnyBackground(value)}
            className="wpbs-background-controls"
        >
            <BreakpointPanels
                label="Background"
                value={value}
                onChange={handleChange}
                render={{
                    base: ({ entry, update }) => {
                        const currentEntry = entry || {};
                        const props = currentEntry.props || {};

                        const onChange = (patch = {}, reset = false) => {
                            const nextEntry = mergeEntryProps(currentEntry, patch, reset);
                            update(nextEntry);
                        };

                        return (
                            <BackgroundPanelFields
                                settings={props}
                                isBreakpoint={false}
                                onChange={onChange}
                            />
                        );
                    },

                    breakpoints: ({ entry, update }) => {
                        const currentEntry = entry || {};
                        const props = currentEntry.props || {};

                        const onChange = (patch = {}, reset = false) => {
                            const nextEntry = mergeEntryProps(currentEntry, patch, reset);
                            update(nextEntry);
                        };

                        return (
                            <BackgroundPanelFields
                                settings={props}
                                isBreakpoint={true}
                                onChange={onChange}
                            />
                        );
                    },
                }}
            />
        </PanelBody>
    );
};

export function hasAnyBackground(bgSettings = {}) {
    const { props = {}, breakpoints = {} } = bgSettings || {};

    const check = (obj) => {
        if (!obj) return false;
        if (obj.type) return true;
        if (obj.image?.id) return true;
        if (obj.video?.source) return true;
        if (obj.color) return true;
        if (obj.overlay) return true;
        if (obj.fade) return true;
        return false;
    };

    if (check(props)) return true;

    for (const bp of Object.values(breakpoints)) {
        if (check(bp?.props)) return true;
    }

    return false;
}

const BackgroundVideo = ({ settings = {}, isSave = false }) => {
    if (!isSave) return null;

    const { props = {}, breakpoints = {} } = settings || {};
    const bpDefs = WPBS?.settings?.breakpoints ?? {};
    const entries = [];

    // ----------------------------------------
    // 1. BASE VIDEO (real source only)
    // ----------------------------------------
    const baseVideo = props?.video;
    const hasRealBase = !!baseVideo?.source;

    if (baseVideo?.source) {
        entries.push({
            size: Infinity,
            video: baseVideo,
        });
    }

    // ----------------------------------------
    // 2. BREAKPOINT VIDEO OVERRIDES
    // ----------------------------------------
    Object.entries(breakpoints || {}).forEach(([bpKey, bpData]) => {
        const size = bpDefs?.[bpKey]?.size ?? 0;
        const bpVideo = bpData?.props?.video;

        // CASE A — breakpoint has a video object
        if (bpVideo) {
            if (bpVideo.source) {
                // real video
                entries.push({ size, video: bpVideo });
            } else if (bpVideo.isPlaceholder && hasRealBase) {
                // empty / placeholder → implicit disable
                entries.push({
                    size,
                    video: { source: "#", mime: "video/mp4" },
                });
            }
            return;
        }

        // CASE B — breakpoint has NO video key at all
        if (hasRealBase) {
            entries.push({
                size,
                video: { source: "#", mime: "video/mp4" },
            });
        }
    });

    // If no entries at all, bail
    if (!entries.length) return null;

    // ----------------------------------------
    // Sort: base first (Infinity)
    // ----------------------------------------
    entries.sort((a, b) => b.size - a.size);

    const baseEntry = entries.find((e) => e.size === Infinity);
    const baseVideoObj = baseEntry?.video ?? null;

    const bpEntries = entries.filter((e) => e.size !== Infinity);

    // ----------------------------------------
    // Render
    // ----------------------------------------
    return (
        <video
            muted
            loop
            autoPlay
            playsInline
            className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
        >
            {/* BREAKPOINT SOURCES */}
            {bpEntries.map(({ size, video }, i) => {
                const mq =
                    Number.isFinite(size) &&
                    size > 0 &&
                    size !== Infinity
                        ? `(max-width:${size - 1}px)`
                        : null;

                return (
                    <source
                        key={`bp-${i}`}
                        data-src={video.source || "#"}
                        data-media={mq}
                        type={video.mime || "video/mp4"}
                    />
                );
            })}

            {/* BASE SOURCE (real source only) */}
            {baseVideoObj?.source && (
                <source
                    data-src={baseVideoObj.source}
                    type={baseVideoObj.mime || "video/mp4"}
                />
            )}
        </video>
    );
};

export function BackgroundElement({ attributes = {}, isSave = false }) {
    const { "wpbs-background": bgSettings = {} } = attributes;

    if (!hasAnyBackground(bgSettings)) return null;

    const bgClass = [
        "wpbs-background",
        "absolute top-0 left-0 w-full h-full z-0 pointer-events-none",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={bgClass}>
            <BackgroundVideo settings={bgSettings} isSave={!!isSave} />
        </div>
    );
}
