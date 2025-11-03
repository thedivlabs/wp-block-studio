import {memo, useCallback} from '@wordpress/element';

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

    const value = settings?.[slug];

    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault(); // prevent accidental form submit
                callback();
            }
        },
        [callback]
    );

    const handleBlur = useCallback(() => callback(), [callback]);

    let control = null;

    controlProps.__next40pxDefaultSize = true;
    controlProps.__nextHasNoMarginBottom = true;
    controlProps.label = label;

    console.log(value);

    switch (type) {

        case 'text':
            control = (
                <TextControl
                    id={inputId}
                    value={value ?? ''}
                    aria-label={label}
                    onChange={(v) => callback(v === '' ? '' : v)}
                    type={'text'}
                    {...controlProps}
                />
            );
            break;

        case 'number':
            control = (
                <NumberControl
                    id={inputId}
                    value={value ?? ''}
                    aria-label={label}
                    onChange={(v) => callback(v === '' ? '' : v)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    {...controlProps}
                />
            );
            break;

        case 'select':
            control = (
                <SelectControl
                    id={inputId}
                    value={value ?? ''}
                    options={controlProps.options || []}
                    aria-label={label}
                    onChange={(v) => callback(v === '' ? '' : v)}
                    onKeyDown={handleKeyDown}
                    __nextHasNoMarginBottom
                    {...controlProps}
                />
            );
            break;

        case 'toggle':
            control = (
                <ToggleControl
                    aria-label={label}
                    checked={!!value}
                    onChange={(checked) => callback(!!checked)}
                    onKeyDown={handleKeyDown}
                    {...controlProps}
                />
            );
            break;

        case 'unit':
            control = (
                <UnitControl
                    id={inputId}
                    value={value ?? ''}
                    units={
                        controlProps.units || [
                            {value: 'px', label: 'px'},
                            {value: 'em', label: 'em'},
                            {value: 'rem', label: 'rem'},
                            {value: '%', label: '%'},
                        ]
                    }
                    onUnitChange={() => callback('')}
                    onChange={(v) => callback(v === '' ? '' : v)}
                    onBlur={handleBlur}
                    aria-label={label}
                    onKeyDown={handleKeyDown}
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
                            value,
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
                    value={value ?? field?.default ?? ''}
                    onChange={(v) => callback(v === '' ? '' : v)}
                    __nextHasNoMarginBottom
                />
            );
            break;

        case 'box':
            control = (
                <BoxControl
                    label={label}
                    values={value}
                    onChange={(v) => callback(v === '' ? '' : v)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
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
                        value={value}
                        render={({open}) => (
                            <button type="button" className="components-button" onClick={open}>
                                {value ? 'Replace' : 'Select'} {type}
                            </button>
                        )}
                        __nextHasNoMarginBottom={true}
                    />
                    {value ? (
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
            hasValue={() => value !== undefined}
            label={label}
            onDeselect={() => callback(undefined)}
            onSelect={() => callback('')} // <— initialize with an empty string
            className={fieldClassNames}
            isShownByDefault={false}
        >
            {control}
        </ToolsPanelItem>

    ) : null;
});
