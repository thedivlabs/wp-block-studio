import {memo, useCallback} from "@wordpress/element";
import {MediaUpload, MediaUploadCheck, PanelColorSettings} from "@wordpress/block-editor";
import PreviewThumbnail from "Components/PreviewThumbnail";
import {BaseControl} from "@wordpress/components";
import {ShadowSelector} from "Components/ShadowSelector";
import {extractMinimalImageMeta} from "Includes/helper";


export const Field = memo(({field, settings, callback, isToolsPanel = true}) => {
    const {type, slug, label, full = false, ...controlProps} = field;
    if (!type || !slug || !label) return null;

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
    const fieldClassNames = ["wpbs-layout-tools__field", full ? "--full" : null]
        .filter(Boolean)
        .join(" ");

    // Controlled input: value always comes from settings
    const value = settings?.[slug];

    const commit = useCallback(
        (newValue) => {
            if (newValue !== value) {
                callback(newValue);
            }
        },
        [callback, value]
    );

    let control = null;

    controlProps.__next40pxDefaultSize = true;
    controlProps.__nextHasNoMarginBottom = true;
    controlProps.label = label;

    switch (type) {
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
        case "color":
            const colorFields = controlProps.colors || [];

            const colorSettings = colorFields.map((c) => ({
                slug: c.slug,
                label: c.label,
                value: settings?.[c.slug] ?? "",
                onChange: (newValue) => {
                    // Merge directly instead of nesting under slug
                    const next = {
                        ...settings,
                        [c.slug]: newValue,
                    };
                    commit(next);
                },
            }));

            control = (
                <PanelColorSettings
                    className={'wpbs-controls__color'}
                    enableAlpha
                    colorSettings={colorSettings}
                    __nextHasNoMarginBottom
                />
            );
            break;
        case "range":
            control = (
                <RangeControl
                    id={inputId}
                    label={label}
                    value={value ?? ""}
                    onChange={commit}
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
                        value={value || 'linear-gradient(90deg,#000 0%,#fff 100%)'}
                        gradients={[]}
                        onChange={commit}
                        __nextHasNoMarginBottom
                    />
                </BaseControl>
            );
            break;

        case "text":
            control = (
                <TextControl
                    id={inputId}
                    value={value ?? ""}
                    aria-label={label}
                    onChange={commit}
                    type="text"
                    {...controlProps}
                />
            );
            break;

        case "number":
            control = (
                <NumberControl
                    id={inputId}
                    value={value ?? ""}
                    aria-label={label}
                    onChange={commit}
                    {...controlProps}
                />
            );
            break;

        case "select":
            control = (
                <SelectControl
                    id={inputId}
                    value={value ?? ""}
                    options={controlProps.options || []}
                    aria-label={label}
                    onChange={commit}
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
                    onChange={(checked) => commit(!!checked)}
                    {...controlProps}
                />
            );
            break;

        case "unit":
            control = (
                <UnitControl
                    id={inputId}
                    value={value ?? ""}
                    units={
                        controlProps.units || [
                            {value: "px", label: "px"},
                            {value: "em", label: "em"},
                            {value: "rem", label: "rem"},
                            {value: "%", label: "%"},
                        ]
                    }
                    onChange={commit}
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
                    values={value}
                    onChange={commit}
                    {...controlProps}
                />
            );
            break;

        case "image":
        case "video": {
            const isImage = type === "image";
            const allowedTypes = isImage ? ["image"] : ["video"];
            const currentValue = value || {};

            const onSelect = (media) => {
                const minimal = extractMinimalImageMeta(media);
                commit(minimal); // save to attributes
            };

            const clear = () => commit(null);

            control = (
                <BaseControl label={label} __nextHasNoMarginBottom>
                    <MediaUploadCheck>
                        <MediaUpload
                            title={`Select ${isImage ? "Image" : "Video"}`}
                            allowedTypes={allowedTypes}
                            value={currentValue?.id}
                            onSelect={onSelect}
                            render={({ open }) => (
                                <PreviewThumbnail
                                    image={currentValue}        // minimal image/video object
                                    type={isImage ? "image" : "video"} // <— ADD THIS
                                    onClick={open}            // open library
                                    callback={clear}          // clear field
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

    return control ? (!!isToolsPanel ?
            <ToolsPanelItem
                hasValue={() => value !== undefined && value !== null}
                label={label}
                onDeselect={() => commit(null)}
                onSelect={() => commit("")} // initialize with an empty string
                className={fieldClassNames}
                isShownByDefault={false}
            >
                {control}
            </ToolsPanelItem> : control
    ) : null;
});