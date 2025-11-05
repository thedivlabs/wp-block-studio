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
    
    const localValue = settings?.[slug] ?? null;

    const commit = useCallback((newValue) => {
        if (newValue !== settings?.[slug]) {
            console.log('updating', newValue);
            callback(newValue);
        }
    }, [callback]);


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
                    onChange={(v) => commit(v)}
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
                    onChange={(v) => commit(v)}
                    //onBlur={() => commit(localValue)}

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
                    onChange={(v) => commit(v)}

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
                    onChange={(checked) => commit(!!checked)}

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
                    //onUnitChange={() => commit('')}
                    onChange={(v) => commit(v)}
                    //onBlur={() => commit(localValue)}
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
                            onChange: (v) => commit(v),
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
                    onChange={(v) => commit(v)}
                    __nextHasNoMarginBottom
                />
            );
            break;

        case 'box':
            control = (
                <BoxControl
                    label={label}
                    values={localValue}
                    onChange={(v) => commit(v)}
                    //onBlur={() => commit(localValue)}

                    {...controlProps}
                />
            );
            break;

        case 'image':
        case 'video': {
            const allowedTypes = type === 'image' ? ['image'] : ['video'];
            const clear = () => commit(undefined);
            control = (
                <MediaUploadCheck>
                    <MediaUpload
                        title={label}
                        onSelect={(media) => commit(media)}
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
            hasValue={() => settings?.[slug] !== undefined && settings?.[slug] !== null}
            label={label}
            onDeselect={() => commit(undefined)}
            onSelect={() => commit('')} // <— initialize with an empty string
            className={fieldClassNames}
            isShownByDefault={false}
        >
            {control}
        </ToolsPanelItem>

    ) : null;
});
