import {memo, useCallback, useEffect, useState} from '@wordpress/element';

export const Field = memo(({field, settings, callback}) => {
    const {type, slug, label, full = false, ...controlProps} = field;
    if (!type || !slug || !label) return null;

    const {
        MediaUploadCheck,
        MediaUpload,
        SelectControl,
        ToggleControl,
        RangeControl,
        GradientPicker,
        PanelColorSettings,
        TextControl,
        __experimentalToolsPanelItem: ToolsPanelItem,
        __experimentalBoxControl: BoxControl,
        __experimentalUnitControl: UnitControl,
        __experimentalNumberControl: NumberControl,
    } = wp.components || {};

    const inputId = `wpbs-${slug}`;

    const fieldClassNames = ['wpbs-layout-tools__field', full ? '--full' : null]
        .filter(Boolean)
        .join(' ');


    const [localValue, setLocalValue] = useState(settings?.[slug]);

    useEffect(() => {
        if (localValue === settings?.[slug] || localValue === '') return;
        callback(localValue);
    }, [localValue]);


    let control = null;

    controlProps.__next40pxDefaultSize = true;
    controlProps.__nextHasNoMarginBottom = true;
    controlProps.label = label;

    switch (type) {

        case 'text':
            control = (
                <TextControl
                    id={inputId}
                    value={localValue}
                    aria-label={label}
                    onChange={(v) => setLocalValue(v)}
                    type={'text'}
                    {...controlProps}
                />
            );
            break;

        case 'number':
            control = (
                <NumberControl
                    id={inputId}
                    value={localValue}
                    aria-label={label}
                    onChange={(v) => setLocalValue(v)}
                    onBlur={() => callback(localValue)}

                    {...controlProps}
                />
            );
            break;

        case 'select':
            control = (
                <SelectControl
                    id={inputId}
                    value={localValue}
                    options={controlProps.options || []}
                    aria-label={label}
                    onChange={(v) => setLocalValue(v)}

                    __nextHasNoMarginBottom
                    {...controlProps}
                />
            );
            break;

        case 'toggle':
            control = (
                <ToggleControl
                    aria-label={label}
                    checked={!!localValue}
                    onChange={(checked) => callback(!!checked)}

                    {...controlProps}
                />
            );
            break;

        case 'unit':
            control = (
                <UnitControl
                    id={inputId}
                    value={localValue}
                    units={
                        controlProps.units || [
                            {value: 'px', label: 'px'},
                            {value: 'em', label: 'em'},
                            {value: 'rem', label: 'rem'},
                            {value: '%', label: '%'},
                        ]
                    }
                    onUnitChange={() => callback('')}
                    onChange={(v) => setLocalValue(v)}
                    onBlur={() => callback(localValue)}
                    aria-label={label}

                    isResetValueOnUnitChange={true}
                    {...controlProps}
                />
            );
            break;

        case 'color':
            control = (
                <PanelColorSettings
                    enableAlpha
                    colorSettings={[
                        {
                            slug,
                            label,
                            localValue,
                            onChange: (v) => callback(v),
                            isShownByDefault: true,
                        },
                    ]}
                    __nextHasNoMarginBottom
                />
            );
            break;

        case 'gradient':
            control = (
                <GradientPicker
                    key={slug}
                    gradients={controlProps.gradients || []}
                    clearable
                    value={localValue ?? field?.default ?? ''}
                    onChange={(v) => setLocalValue(v)}
                    __nextHasNoMarginBottom
                />
            );
            break;

        case 'box':
            control = (
                <BoxControl
                    label={label}
                    values={localValue}
                    onChange={(v) => setLocalValue(v)}
                    onBlur={() => callback(localValue)}

                    {...controlProps}
                />
            );
            break;

        case 'image':
        case 'video': {
            const allowedTypes = type === 'image' ? ['image'] : ['video'];
            const clear = () => callback(undefined);
            control = (
                <MediaUploadCheck>
                    <MediaUpload
                        title={label}
                        onSelect={(media) => callback(media)}
                        allowedTypes={allowedTypes}
                        value={localValue}
                        render={({open}) => (
                            <button type="button" className="components-button" onClick={open}>
                                {localValue ? 'Replace' : 'Select'} {type}
                            </button>
                        )}
                        __nextHasNoMarginBottom={true}
                    />
                    {localValue ? (
                        <button type="button" className="components-button is-secondary" onClick={clear}>
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
            hasValue={() => localValue !== undefined && localValue !== null}
            label={label}
            onDeselect={() => callback(undefined)}
            onSelect={() => setLocalValue('')} // <— initialize with an empty string
            className={fieldClassNames}
            isShownByDefault={false}
        >
            {control}
        </ToolsPanelItem>

    ) : null;
});
