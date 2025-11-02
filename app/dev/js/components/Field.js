import {memo, useCallback} from '@wordpress/element';
import {useDebouncedCommit} from 'Includes/style-utils';

export const Field = memo(({field, settings, callback}) => {
    const {type, slug, label, large = false, ...controlProps} = field;
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
    const className = ['wpbs-layout-tools__field', large ? '--full' : null]
        .filter(Boolean)
        .join(' ');
    const value = settings?.[slug];

    // Use shared debounce/commit hook
    const {change, commit} = useDebouncedCommit(value, callback);

    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault(); // prevent accidental form submit
                commit();
            }
        },
        [commit]
    );

    const handleBlur = useCallback(() => commit(), [commit]);

    let control = null;

    controlProps.__next40pxDefaultSize = true;
    controlProps.__nextHasNoMarginBottom = true;
    controlProps.label = label;

    switch (type) {
        case 'text':
            control = (
                <TextControl
                    id={inputId}
                    value={value ?? ''}
                    aria-label={label}
                    onChange={(v) => change(v === '' ? '' : v)}
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
                    onChange={(v) => change(v === '' ? '' : v)}
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
                    onChange={(v) => commit(v === '' ? undefined : v)}
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
                    onChange={(checked) => commit(!!checked)}
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
                    onUnitChange={() => change('')}
                    onChange={(v) => change(v)}
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
                            onChange: (v) => change(v),
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
                    onChange={(v) => change(v)}
                    __nextHasNoMarginBottom
                />
            );
            break;

        case 'box':
            control = (
                <BoxControl
                    label={label}
                    values={value}
                    onChange={(v) => change(v)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    {...controlProps}
                />
            );
            break;

        case 'image':
        case 'video': {
            const allowedTypes = type === 'image' ? ['image'] : ['video'];
            const clear = () => commit('');
            control = (
                <MediaUploadCheck>
                    <MediaUpload
                        title={label}
                        onSelect={(media) => commit(media)}
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
            style={{ gridColumn: 'span 1' }}
            hasValue={() => value !== undefined && value !== ''}
            label={label}
            onDeselect={() => commit(undefined)}
        >
            {control}
        </ToolsPanelItem>
    ) : null;
});
