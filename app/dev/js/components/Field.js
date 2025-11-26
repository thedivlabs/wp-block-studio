import {memo, useCallback} from "@wordpress/element";
import {MediaUpload, MediaUploadCheck, PanelColorSettings} from "@wordpress/block-editor";
import PreviewThumbnail from "Components/PreviewThumbnail";
import {BaseControl, __experimentalGrid as Grid} from "@wordpress/components";
import {ShadowSelector} from "Components/ShadowSelector";
import {normalizeMedia} from "Includes/helper";
import {IconControl} from "Components/IconControl";

export const Field = memo(function Field({
                                             field,
                                             settings,
                                             callback,
                                             isToolsPanel = true,
                                             props = {}
                                         }) {
    const {type, defaultValue = "", itemProps, slug, label, full = false, ...controlProps} = field;
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
    const fieldClassNames = ["wpbs-control", full ? "--full" : null].filter(Boolean).join(" ");

    const value = settings?.[slug];

    // 🔥 ALWAYS send patch objects upward
    const commit = useCallback(
        (patch) => {
            if (!patch) return;
            callback(patch); // example: { "icon-color": "#fff" }
        },
        [callback]
    );

    let control = null;

    controlProps.__next40pxDefaultSize = true;
    controlProps.__nextHasNoMarginBottom = true;
    controlProps.isShownByDefault = false;
    controlProps.label = label;

    switch (type) {
        case "icon":
            control = (
                <IconControl
                    fieldKey={slug}
                    value={value || defaultValue}
                    onChange={(val) => commit({[slug]: val})}
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
                    label: `${data.label} (${data.size}px)`,
                    value: key,
                })),
            ];

            control = (
                <SelectControl
                    id={inputId}
                    label={label}
                    value={value || ""}
                    options={bpOptions}
                    onChange={(v) => commit({[slug]: v})}
                    {...controlProps}
                />
            );
            break;
        }

        case "composite":
            control = (
                <BaseControl label={label} className="wpbs-composite-field --full">
                    <Grid columns={2} columnGap={8} rowGap={15} className="wpbs-composite-field__grid">
                        {field.fields.map((sub) => (
                            <Field
                                key={sub.slug}
                                field={sub}
                                settings={settings}
                                isToolsPanel={false}
                                callback={(val) => commit(val)} // val is already { key: value }
                            />
                        ))}
                    </Grid>
                </BaseControl>
            );
            break;

        case "shadow":
            control = (
                <ShadowSelector
                    label={label}
                    value={value}
                    onChange={(val) => commit({[slug]: val})}
                    {...controlProps}
                />
            );
            break;

        case "color": {
            const colorFields = controlProps.colors || [];

            const colorSettings = colorFields.map((c) => ({
                slug: c.slug,
                label: c.label,
                value: settings?.[c.slug] ?? "",
                onChange: (newValue) => commit({[c.slug]: newValue}),
                onColorCleared: () => commit({[c.slug]: ""}),
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
                    {...controlProps}
                />
            );
            break;

        case "gradient":
            control = (
                <BaseControl label={label}>
                    <GradientPicker
                        id={inputId}
                        value={value || defaultValue}
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
                    onChange={(v) => commit({[slug]: v})}
                    {...controlProps}
                />
            );
            break;

        case "number":
            control = (
                <NumberControl
                    id={inputId}
                    value={value || defaultValue}
                    onChange={(v) => commit({[slug]: v})}
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
                    onChange={(v) => commit({[slug]: v})}
                    {...controlProps}
                />
            );
            break;

        case "toggle":
            control = (
                <ToggleControl
                    checked={!!value}
                    onChange={(checked) => commit({[slug]: !!checked})}
                    {...controlProps}
                />
            );
            break;

        case "unit":
            control = (
                <UnitControl
                    id={inputId}
                    value={value || defaultValue}
                    onChange={(v) => commit({[slug]: v})}
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
                                    callback={(v) => commit({[slug]: v})}
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

    return control ? (
        isToolsPanel ? (
            <ToolsPanelItem
                hasValue={() => true}
                label={label}
                onDeselect={() => commit({[slug]: null})}
                className={fieldClassNames}
                {...itemProps}
            >
                {control}
            </ToolsPanelItem>
        ) : (
            <div className={fieldClassNames}>{control}</div>
        )
    ) : null;
});
