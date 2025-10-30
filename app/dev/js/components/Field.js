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
                <label className={className} htmlFor={inputId}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --text">
                        <TextControl
                            id={inputId}
                            value={value ?? ''}
                            aria-label={label}
                            onChange={(v) => changeDebounced(v)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            {...controlProps}
                        />
                    </div>
                </label>
            );
            break;

        case 'number':
            control = (
                <label className={className} htmlFor={inputId}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --number">
                        <NumberControl
                            id={inputId}
                            value={value ?? ''}
                            aria-label={label}
                            onChange={(v) => changeDebounced(v === '' ? '' : v)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            {...controlProps}
                        />
                    </div>
                </label>
            );
            break;

        case 'select':
            control = (
                <label className={className} htmlFor={inputId}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --select">
                        <SelectControl
                            id={inputId}
                            value={value ?? ''}
                            options={controlProps.options || []}
                            aria-label={label}
                            onChange={(v) => commitNow(v === '' ? undefined : v)}
                            onKeyDown={handleKeyDown}
                            __nextHasNoMarginBottom
                        />
                    </div>
                </label>
            );
            break;

        case 'toggle':
            control = (
                <label className={`${className} --toggle`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --toggle">
                        <ToggleControl
                            aria-label={label}
                            checked={!!value}
                            onChange={(checked) => commitNow(!!checked)}
                            onKeyDown={handleKeyDown}
                            {...controlProps}
                        />
                    </div>
                </label>
            );
            break;

        // ——— unit ———
        case 'unit':
            control = (
                <label className={className} htmlFor={inputId}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --unit">
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
                    </div>
                </label>
            );
            break;

// ——— color ———
        case 'color':
            control = (
                <div className={className}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --color">
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
                        />
                    </div>
                </div>
            );
            break;

// ——— gradient ———
        case 'gradient':
            control = (
                <div className={className}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --gradient">
                        <GradientPicker
                            key={slug}
                            gradients={controlProps.gradients || []}
                            clearable
                            value={value ?? field?.default ?? ''}
                            onChange={(v) => changeDebounced(v)}
                        />
                    </div>
                </div>
            );
            break;

// ——— box ———
        case 'box':
            control = (
                <div className={className}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --box">
                        <BoxControl
                            label={label}
                            values={value}
                            onChange={(v) => changeDebounced(v)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            {...controlProps}
                        />
                    </div>
                </div>
            );
            break;

// ——— composite ———
        case 'composite':
            control = (
                <div className={`${className} --composite`}>
                    <div className="wpbs-layout-tools__label">{label}</div>
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
            );
            break;

// ——— image / video ———
        case 'image':
        case 'video': {
            const allowedTypes = type === 'image' ? ['image'] : ['video'];
            const clear = () => commitNow('');
            control = (
                <div className={className}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --media">
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
                            />
                            {value ? (
                                <button type="button" className="components-button is-secondary" onClick={clear}>
                                    Clear
                                </button>
                            ) : null}
                        </MediaUploadCheck>
                    </div>
                </div>
            );
            break;
        }


        default:
            control = null;
    }

    return control;
});
