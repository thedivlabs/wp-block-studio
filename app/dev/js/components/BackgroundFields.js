import { memo, Fragment, useCallback } from "@wordpress/element";
import {
    __experimentalGrid as Grid,
    __experimentalToolsPanel as ToolsPanel,
    BaseControl,
    GradientPicker,
    SelectControl,
    ToggleControl,
} from "@wordpress/components";
import { PanelColorSettings } from "@wordpress/block-editor";
import { Field } from "Components/Field";

/**
 * BackgroundFields
 *
 * A full replacement for BackgroundPanelFields + the old BackgroundFields.
 * Identical architecture to LayoutFields, but background-specific:
 *
 * - Hard-coded fields (Type, Image, Video, Overlay, Color, Fixed, Eager)
 * - Dynamic fields from `backgroundFieldsMap`
 * - Emits `{ slug: value }` patch objects
 * - Handles `resetAll`
 */
export const BackgroundFields = memo(function BackgroundFields({
                                                                   settings = {},
                                                                   updateFn,
                                                                   isBreakpoint = false,
                                                                   label = "Background",
                                                               }) {
    const { backgroundFieldsMap: map = [] } = window?.WPBS_StyleEditor ?? {};

    // simple wrapper: ensures updates always emit patches shaped like { slug: value }
    const onUpdate = useCallback(
        (slug, value) => updateFn({ [slug]: value }),
        [updateFn]
    );

    const hasSettings = settings && Object.keys(settings).length > 0;
    const type = settings?.type ?? "";

    return (
        <Fragment>
            <Grid columns={1} columnGap={15} rowGap={20} style={{padding:'16px'}}>


                <SelectControl
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                    label="Type"
                    value={type}
                    onChange={(newType) => {
                        if (newType === type) return;

                        updateFn({
                            type: newType,
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
                    <Fragment>

                        {(type === "image" || type === "featured-image") && (
                            <Field
                                field={{
                                    type: "image",
                                    slug: "image",
                                    label: "Image",
                                    full: true,
                                }}
                                settings={settings}
                                callback={(v) => onUpdate("image", v)}
                                isToolsPanel={false}
                            />
                        )}


                        {type === "video" && (
                            <Field
                                field={{
                                    type: "video",
                                    slug: "video",
                                    label: "Video",
                                    full: true,
                                }}
                                settings={settings}
                                callback={(v) => onUpdate("video", v)}
                                isToolsPanel={false}
                            />
                        )}


                        <BaseControl label="Overlay">
                            <div className="wpbs-background-controls__card">
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
                                    onChange={(value) => onUpdate("overlay", value)}
                                />
                            </div>
                        </BaseControl>


                        <PanelColorSettings
                            className="wpbs-controls__color"
                            enableAlpha
                            colorSettings={[
                                {
                                    slug: "color",
                                    label: "Color",
                                    value: settings?.color ?? undefined,
                                    onChange: (value) => onUpdate("color", value),
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
                                    onChange={(v) => onUpdate("eager", v)}
                                />
                            )}

                            {type !== "video" && (
                                <ToggleControl
                                    label="Fixed"
                                    checked={!!settings?.fixed}
                                    onChange={(v) => onUpdate("fixed", v)}
                                />
                            )}
                        </Grid>




                    </Fragment>
                )}
            </Grid>
            <ToolsPanel
                label="Advanced Background"
                className="wpbs-background-tools"
                resetAll={() => updateFn({}, true)}
            >
                {map.map((field) => (
                    <Field
                        key={field.slug}
                        field={field}
                        settings={settings}
                        callback={(v) => onUpdate(field.slug, v)}
                        isToolsPanel={true}
                    />
                ))}
            </ToolsPanel>
        </Fragment>
    );
});