import {memo, Fragment, useCallback} from "@wordpress/element";
import {
    __experimentalGrid as Grid,
    __experimentalToolsPanel as ToolsPanel,
    BaseControl,
    GradientPicker,
    SelectControl,
    ToggleControl,
} from "@wordpress/components";
import {PanelColorSettings} from "@wordpress/block-editor";
import {Field} from "Components/Field";

export const BackgroundFields = function BackgroundFields({
                                                              settings = {},
                                                              updateFn,
                                                              isBreakpoint = false,
                                                              label = "Background",
                                                          }) {
    const {backgroundFieldsMap: map = []} =
    window?.WPBS_StyleEditor ?? {};

    // `updateFn` expects a patch object for this entry's props
    const onPatch = useCallback(
        (patch) => {
            if (!patch || typeof patch !== "object") return;
            updateFn(patch);
        },
        [updateFn]
    );

    const type = settings?.type ?? "";
    const hasSettings = !!settings && Object.keys(settings).length > 0;

    return (
        <Fragment>
            <Grid
                columns={1}
                columnGap={15}
                rowGap={20}
                style={{padding: "16px"}}
            >
                <SelectControl
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                    label="Type"
                    value={type}
                    onChange={(newType) => {
                        if (newType === type) return;

                        // Reset media when changing type
                        updateFn({
                            type: newType,
                            media: {},
                        });
                    }}
                    options={[
                        {label: "Select", value: ""},
                        {label: "Image", value: "image"},
                        {label: "Featured Image", value: "featured-image"},

                        ...(isBreakpoint
                            ? [
                                {
                                    label: "Featured Image Mobile",
                                    value: "featured-image-mobile",
                                },
                            ]
                            : []),

                        {label: "Video", value: "video"},
                    ]}
                />

                {!hasSettings ? null : (
                    <Fragment>
                        {(type === "image" ||
                            type === "featured-image" ||
                            type === "featured-image-mobile" ||
                            type === "video") && (
                            <Field
                                field={{
                                    type: type === "video" ? "video" : "image",
                                    slug: "media",
                                    label: type === "video" ? "Video" : "Image",
                                    full: true,
                                }}
                                settings={settings}
                                callback={onPatch}
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
                                    onChange={(value) =>
                                        onPatch({overlay: value})
                                    }
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
                                    onChange: (value) =>
                                        onPatch({color: value}),
                                },
                            ]}
                            __nextHasNoMarginBottom
                        />

                        <Grid columns={2} columnGap={15} rowGap={20}>
                            {!isBreakpoint && (
                                <ToggleControl
                                    label="Eager"
                                    checked={!!settings?.eager}
                                    onChange={(v) =>
                                        onPatch({eager: !!v})
                                    }
                                />
                            )}

                            {type !== "video" && (
                                <ToggleControl
                                    label="Fixed"
                                    checked={!!settings?.fixed}
                                    onChange={(v) =>
                                        onPatch({fixed: !!v})
                                    }
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
                        callback={onPatch}
                        isToolsPanel={true}
                    />
                ))}
            </ToolsPanel>
        </Fragment>
    );
};
