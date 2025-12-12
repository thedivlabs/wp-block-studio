import {memo, useCallback} from "@wordpress/element";
import {MediaUpload, MediaUploadCheck, PanelColorSettings} from "@wordpress/block-editor";
import PreviewThumbnail from "Components/PreviewThumbnail";
import {BaseControl, __experimentalGrid as Grid} from "@wordpress/components";
import {ShadowSelector} from "Components/ShadowSelector";
import {cleanObject, getEditorPalettes, normalizeMedia} from "Includes/helper";
import {IconControl} from "Components/IconControl";
import {useMemo} from "react";

export const Field = memo(
    ({
         field,
         settings,
         callback,
         isToolsPanel = true,
         props = {}
     }) => {

        const {
            type,
            defaultValue = "",
            itemProps,
            slug,
            label,
            full = false,
            ...controlProps
        } = field;

        if (!type || !label) return null;

        const {
            SelectControl,
            GradientPicker,
            ToggleControl,
            RangeControl,
            TextControl,
            __experimentalToolsPanelItem: ToolsPanelItem,
            __experimentalBoxControl: BoxControl,
            __experimentalUnitControl: UnitControl,
            __experimentalNumberControl: NumberControl,
        } = wp.components || {};

        const inputId = `wpbs-${slug}`;
        const value = settings?.[slug];

        const fieldClassNames = [
            "wpbs-control",
            full ? "--full" : null,
        ]
            .filter(Boolean)
            .join(" ");

        const {colors, gradients} = useMemo(() => getEditorPalettes(), []);

        //
        // UNIVERSAL commit wrapper — always sends { slug: newValue }
        //
        const commit = useCallback(
            (patch) => {
                callback(patch);
            },
            [callback]
        );


        let control = null;

        //
        // ControlProp defaults
        //
        controlProps.__next40pxDefaultSize = true;
        controlProps.__nextHasNoMarginBottom = true;
        controlProps.isShownByDefault = false;
        controlProps.label = label;

        //
        // FIELD TYPES
        //
        switch (type) {
            case "border": {
                const {BorderControl} = wp.components || {};

                if (!BorderControl) {
                    control = null;
                    break;
                }

                const current = value || defaultValue || {};

                control = (
                    <BorderControl

                        label={label}
                        value={current}
                        disableCustomColors={false}
                        disableUnits={false}
                        enableAlpha={true}
                        enableStyle={true}
                        colors={colors}              // ← your colors from editor settings
                        gradients={gradients}              // ← your colors from editor settings
                        onChange={(v) => commit({[slug]: v})}
                        __nextHasNoMarginBottom
                        __next40pxDefaultSize
                        {...controlProps}
                    />
                );
                break;
            }
            case "icon":
                control = (
                    <IconControl
                        fieldKey={slug}
                        value={value || defaultValue || ""}
                        onChange={(v) => commit({[slug]: v})}
                        props={props || {}}
                        label={label}
                        isCommit={false}
                    />
                );
                break;

            case "breakpoint": {
                const breakpoints = WPBS?.settings?.breakpoints || {};
                const bpOptions = [
                    {label: "Select", value: ""},
                    ...Object.entries(breakpoints).map(([key, data]) => ({
                        label: `${data?.label} (${data?.size}px)`,
                        value: key,
                    })),
                ];

                control = (
                    <SelectControl
                        id={inputId}
                        label={label}
                        value={value || defaultValue || ""}
                        options={bpOptions}
                        aria-label={label}
                        onChange={(v) => commit({[slug]: v})}
                        {...controlProps}
                    />
                );
                break;
            }

            case "composite":
                control = (
                    <BaseControl
                        label={label}
                        className="wpbs-composite-field --full"
                    >
                        <Grid
                            columns={2}
                            columnGap={8}
                            rowGap={15}
                            className="wpbs-composite-field__grid"
                        >
                            {field.fields.map((sub) => (
                                <Field
                                    key={sub.slug}
                                    field={sub}
                                    settings={settings}
                                    isToolsPanel={false}
                                    callback={(patch) => callback(patch)}
                                />
                            ))}
                        </Grid>
                    </BaseControl>
                );
                break;
            case "divider":
                control = (
                    <div
                        style={{
                            width: "100%",
                            paddingBottom: "5px",
                            borderBottom: "1px solid #ddd",
                            textAlign: "left",
                            fontSize: "14px",
                            lineHeight: "1.3",
                            color: "#dadada",
                            margin: "10px 0",
                        }}
                    >
                        {label}
                    </div>
                );
                break;

            case "shadow":
                control = (
                    <ShadowSelector
                        label={label}
                        value={value || defaultValue}
                        onChange={(v) => commit({[slug]: v})}
                        {...controlProps}
                    />
                );
                break;

            //
            // COLOR FIELD — fix broken hasValue + correct deselect behavior
            //
            case "color": {
                const colorFields = controlProps.colors || [];

                const colorSettings = colorFields.map((c) => ({
                    slug: c.slug,
                    label: c.label,
                    value: settings?.[c.slug] ?? "",
                    onChange: (newValue) => {
                        const result = {[c.slug]: newValue};
                        callback(result);
                    },
                }));

                control = (
                    <PanelColorSettings
                        className="wpbs-controls__color"
                        enableAlpha
                        colorSettings={colorSettings}
                        __nextHasNoMarginBottom
                    />
                );
                break;
            }

            case "range":
                control = (
                    <RangeControl
                        id={inputId}
                        label={label}
                        value={value ?? defaultValue}
                        onChange={(v) => commit({[slug]: v})}
                        min={controlProps.min ?? 0}
                        max={controlProps.max ?? 100}
                        __nextHasNoMarginBottom
                    />
                );
                break;

            case "gradient":
                control = (
                    <BaseControl label={label}>
                        <GradientPicker
                            id={inputId}
                            value={value || defaultValue || undefined}
                            gradients={controlProps.gradients || []}
                            clearable={controlProps.clearable ?? false}
                            onChange={(v) => commit({[slug]: v})}
                            __nextHasNoMarginBottom
                        />
                    </BaseControl>
                );
                break;

            case "text":
                control = (
                    <TextControl
                        id={inputId}
                        value={value || defaultValue}
                        aria-label={label}
                        onChange={(v) => commit({[slug]: v})}
                        type="text"
                        {...controlProps}
                    />
                );
                break;

            case "number":
                control = (
                    <NumberControl
                        id={inputId}
                        value={value || defaultValue}
                        aria-label={label}
                        onChange={(v) => commit({[slug]: v})}
                        isShiftStepEnabled={true}
                        {...controlProps}
                    />
                );
                break;

            case "select":
                control = (
                    <SelectControl
                        id={inputId}
                        value={value || defaultValue}
                        options={controlProps.options || []}
                        aria-label={label}
                        onChange={(v) => commit({[slug]: v})}
                        __nextHasNoMarginBottom
                        {...controlProps}
                    />
                );
                break;

            case "toggle":
                control = (
                    <ToggleControl
                        aria-label={label}
                        checked={!!value}
                        onChange={(checked) =>
                            commit({[slug]: !!checked})
                        }
                        {...controlProps}
                    />
                );
                break;

            case "unit":
                control = (
                    <UnitControl
                        id={inputId}
                        value={value || defaultValue}
                        units={
                            controlProps.units || [
                                {value: "px", label: "px"},
                                {value: "em", label: "em"},
                                {value: "rem", label: "rem"},
                                {value: "%", label: "%"},
                            ]
                        }
                        onChange={(v) => commit({[slug]: v})}
                        aria-label={label}
                        isResetValueOnUnitChange
                        {...controlProps}
                    />
                );
                break;

            case "box":
                control = (
                    <BoxControl
                        label={label}
                        values={value || defaultValue}
                        onChange={(v) => commit({[slug]: v})}
                        {...controlProps}
                    />
                );
                break;

            //
            // IMAGE / VIDEO — full fix (normalizeMedia + correct callback)
            //
            case "image":
            case "video": {
                const isImage = type === "image";
                const allowedTypes = isImage ? ["image"] : ["video"];

                const currentValue = value ?? null;

                const onSelect = (wpMediaObject) => {
                    const normalized = normalizeMedia(wpMediaObject);
                    commit({[slug]: normalized});
                };

                control = (
                    <BaseControl label={label} __nextHasNoMarginBottom>
                        <MediaUploadCheck>
                            <MediaUpload
                                title={`Select ${isImage ? "Image" : "Video"}`}
                                allowedTypes={allowedTypes}
                                value={currentValue?.id || "#"}
                                onSelect={onSelect}
                                render={({open}) => (
                                    <PreviewThumbnail
                                        image={currentValue}
                                        onSelectClick={open}
                                        callback={(mediaValue) =>
                                            // `mediaValue` must be the RAW media object,
                                            // NOT { media: … }
                                            commit({[slug]: mediaValue})
                                        }
                                        style={{
                                            objectFit: "contain",
                                            borderRadius: "6px",
                                        }}
                                    />
                                )}
                            />
                        </MediaUploadCheck>
                    </BaseControl>
                );
                break;
            }

            default:
                control = null;
        }

        //
        // FIXED hasValue logic (color + composite)
        //
        const hasValue = () => {
            if (type === "composite") {
                return field.fields.some(sub => {
                    const v = settings?.[sub.slug];
                    return v != null && v !== "";
                });
            }

            if (type === "color") {
                const slugs =
                    (controlProps.colors || []).map((c) => c.slug);

                return slugs.some((s) => {
                    const v = settings?.[s];
                    return v != null && v !== "";
                });
            }

            const val = settings?.[slug];

            if (
                val &&
                typeof val === "object" &&
                !Array.isArray(val)
            ) {
                return Object.values(val).some((v) => v != null && v !== "");
            }

            return val != null && val !== "";
        };

        //
        // ToolsPanelItem wrapper
        //
        return control ? (
            isToolsPanel ? (
                <ToolsPanelItem
                    hasValue={hasValue}
                    label={label}
                    onDeselect={() => commit({[slug]: null})}
                    onSelect={() => commit({[slug]: ""})}
                    className={fieldClassNames}
                    isShownByDefault={false}
                    {...itemProps}
                >
                    {control}
                </ToolsPanelItem>
            ) : (
                <div className={fieldClassNames}>{control}</div>
            )
        ) : null;
    }
);
