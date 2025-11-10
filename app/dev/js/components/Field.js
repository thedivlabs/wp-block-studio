import {memo, useCallback} from "@wordpress/element";

export const Field = memo(({field, settings, callback}) => {
    const {type, slug, label, full = false, ...controlProps} = field;
    if (!type || !slug || !label) return null;

    const {
        MediaUploadCheck,
        MediaUpload,
        SelectControl,
        GradientPicker,
        ToggleControl,
        RangeControl,
        PanelColorSettings,
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
                <GradientPicker
                    id={inputId}
                    label={label}
                    value={value || 'linear-gradient(90deg,#000 0%,#fff 100%)'}
                    gradients={[]}
                    onChange={commit}
                    __nextHasNoMarginBottom
                />
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

        case "color":
            control = (
                <PanelColorSettings
                    enableAlpha
                    colorSettings={[
                        {
                            slug,
                            label,
                            value,
                            onChange: commit,
                            isShownByDefault: true,
                        },
                    ]}
                    __nextHasNoMarginBottom
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
            const allowedTypes = type === "image" ? ["image"] : ["video"];
            const clear = () => commit(undefined);
            control = (
                <MediaUploadCheck>
                    <MediaUpload
                        title={label}
                        onSelect={commit}
                        allowedTypes={allowedTypes}
                        value={value}
                        render={({open}) => (
                            <button
                                type="button"
                                className="components-button"
                                onClick={open}
                            >
                                {value ? "Replace" : "Select"} {type}
                            </button>
                        )}
                        __nextHasNoMarginBottom
                    />
                    {value ? (
                        <button
                            type="button"
                            className="components-button is-secondary"
                            onClick={clear}
                        >
                            Clear
                        </button>
                    ) : null}
                </MediaUploadCheck>
            );
            break;
        }

        default:
            control = null;
    }

    return control ? (
        <ToolsPanelItem
            hasValue={() => value !== undefined && value !== null}
            label={label}
            onDeselect={() => commit(undefined)}
            onSelect={() => commit("")} // initialize with an empty string
            className={fieldClassNames}
            isShownByDefault={false}
        >
            {control}
        </ToolsPanelItem>
    ) : null;
});