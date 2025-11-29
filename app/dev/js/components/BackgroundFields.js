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
import {OVERLAY_GRADIENTS} from "Includes/config";

export const BackgroundFields = function BackgroundFields({
                                                              settings = {},
                                                              updateFn,
                                                              isBreakpoint = false,
                                                              label = "Background",
                                                          }) {
    const {backgroundFieldsMap: map = []} =
    window?.WPBS_StyleEditor ?? {};

    const type = settings?.type ?? "";
    const hasSettings = !!settings && Object.keys(settings).length > 0;

    return (
        <Fragment>
            <Grid columns={1} columnGap={15} rowGap={20} style={{padding: "16px"}}>
                <SelectControl
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                    label="Type"
                    value={type}
                    onChange={(newType) => {
                        if (newType === type) return;

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
                            ? [{label: "Featured Image Mobile", value: "featured-image-mobile"}]
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
                                callback={(obj) => updateFn(obj)}
                                isToolsPanel={false}
                            />
                        )}

                        <BaseControl label="Overlay">
                            <div className="wpbs-background-controls__card">
                                <GradientPicker
                                    gradients={OVERLAY_GRADIENTS}
                                    clearable={false}
                                    value={settings?.overlay ?? undefined}
                                    onChange={(value) =>
                                        updateFn({overlay: value})
                                    }
                                />
                            </div>
                        </BaseControl>

                        <Field
                            field={{
                                type: "color",
                                slug: "color",
                                label: "Color",
                                full: true,
                                colors: [
                                    {slug: "bg-color", label: "Color"},
                                ],
                            }}
                            settings={settings}
                            callback={(obj) => updateFn(obj)}
                            isToolsPanel={false}
                        />


                        <Grid columns={2} columnGap={15} rowGap={20}>
                            {!isBreakpoint && (
                                <ToggleControl
                                    label="Eager"
                                    checked={!!settings?.eager}
                                    onChange={(v) => updateFn({eager: v})}
                                />
                            )}

                            {type !== "video" && (
                                <ToggleControl
                                    label="Fixed"
                                    checked={!!settings?.fixed}
                                    onChange={(v) => updateFn({fixed: v})}
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
                        callback={(obj) => updateFn(obj)}
                        isToolsPanel={true}
                    />
                ))}
            </ToolsPanel>
        </Fragment>
    );
};
