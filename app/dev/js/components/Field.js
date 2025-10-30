import {memo, useMemo, useCallback, useRef} from '@wordpress/element';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';

export const Field = memo(({field, settings, callback}) => {
    const {type, slug, label, large = false, ...controlProps} = field;
    if (!type || !slug || !label) return null;

    const {
        MediaUploadCheck,
        MediaUpload,
        TextControl,
        SelectControl,
        ToggleControl,
        RangeControl,
        GradientPicker,
        PanelColorSettings,
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

    const latestRef = useRef(value);
    const cancelRef = useRef(null);

    // safe equality check before committing
    const safeCallback = useCallback(
        (next) => {
            if (!isEqual(next, value)) callback(next);
        },
        [callback, value]
    );

    // debounced commit for live typing
    const debouncedChange = useMemo(
        () => debounce((next) => safeCallback(next), 900),
        [safeCallback]
    );

    // cancel timeout if user pauses too long
    const scheduleCancel = useCallback(() => {
        clearTimeout(cancelRef.current);
        cancelRef.current = setTimeout(() => {
            debouncedChange.cancel(); // cancel pending commits
        }, 900);
    }, [debouncedChange]);

    const changeDebounced = useCallback(
        (next) => {
            latestRef.current = next;
            debouncedChange(next);
            scheduleCancel(); // restart cancel timer each keystroke
        },
        [debouncedChange, scheduleCancel]
    );

    const commitNow = useCallback(
        (next = latestRef.current) => {
            clearTimeout(cancelRef.current);
            debouncedChange.flush(); // force any pending commit
            safeCallback(next);
        },
        [debouncedChange, safeCallback]
    );

    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault(); // prevent accidental form submit
                commitNow();
            }
        },
        [commitNow]
    );

    // Commit on blur (focus out)
    const handleBlur = useCallback(() => commitNow(), [commitNow]);

    let control = null;

    controlProps.__next40pxDefaultSize = true;
    controlProps.__nextHasNoMarginBottom = true;

    switch (type) {
        case 'text':
            control = (
                <TextControl
                    id={inputId}
                    value={value ?? ''}
                    aria-label={label}
                    onChange={(v) => changeDebounced(v)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
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
                    onChange={(v) => changeDebounced(v === '' ? '' : v)}
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
                    onChange={(v) => commitNow(v === '' ? undefined : v)}
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
                    onChange={(checked) => commitNow(!!checked)}
                    onKeyDown={handleKeyDown}
                    {...controlProps}
                />
            );
            break;

        // ——— unit ———
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
                    onUnitChange={() => changeDebounced('')}
                    onChange={(v) => changeDebounced(v)}
                    onBlur={handleBlur}
                    aria-label={label}
                    onKeyDown={handleKeyDown}
                    isResetValueOnUnitChange={true}
                    {...controlProps}
                />
            );
            break;

// ——— color ———
        case 'color':
            control = (
                <PanelColorSettings
                    enableAlpha
                    colorSettings={[
                        {
                            slug,
                            label,
                            value,
                            onChange: (v) => changeDebounced(v),
                            isShownByDefault: true,
                        },
                    ]}
                    __nextHasNoMarginBottom
                />
            );
            break;

// ——— gradient ———
        case 'gradient':
            control = (
                <GradientPicker
                    key={slug}
                    gradients={controlProps.gradients || []}
                    clearable
                    value={value ?? field?.default ?? ''}
                    onChange={(v) => changeDebounced(v)}
                    __nextHasNoMarginBottom
                />
            );
            break;

// ——— box ———
        case 'box':
            control = (
                <BoxControl
                    label={label}
                    values={value}
                    onChange={(v) => changeDebounced(v)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    {...controlProps}
                />
            );
            break;

// ——— image / video ———
        case 'image':
        case 'video': {
            const allowedTypes = type === 'image' ? ['image'] : ['video'];
            const clear = () => commitNow('');
            control = (
                <MediaUploadCheck>
                    <MediaUpload
                        title={label}
                        onSelect={(media) => commitNow(media)}
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

    if (field.fields) {
        return (<ToolsPanelItem
            hasValue={() => value !== undefined && value !== ''}
            label={label}
            onDeselect={() => commitNow(undefined)}
        >
            <div className={`${className} --composite`}>
                <div className="wpbs-layout-tools__group">
                    {field.fields.map((sub) => (
                        <Field
                            key={sub.slug}
                            field={sub}
                            settings={settings}
                            callback={callback}
                        />
                    ))}
                </div>
            </div>
        </ToolsPanelItem>);
    } else {
        return control ? (<ToolsPanelItem
            hasValue={() => value !== undefined && value !== ''}
            label={label}
            onDeselect={() => commitNow(undefined)}
        >control</ToolsPanelItem>) : control;
    }


});
