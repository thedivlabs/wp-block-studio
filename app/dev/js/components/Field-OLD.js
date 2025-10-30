import {memo, useCallback, useLayoutEffect, useMemo, useRef} from '@wordpress/element';
import {
    PanelColorSettings,

    MediaUpload,

    MediaUploadCheck,

    __experimentalBoxControl as BoxControl,

    GradientPicker
} from '@wordpress/components';
import {ShadowSelector} from 'Components/ShadowSelector';
import PreviewThumbnail from 'Components/PreviewThumbnail';
import debounce from 'lodash/debounce';

export const Field = memo(({field, settings, callback}) => {
    const {type, slug, label, large = false, ...controlProps} = field;
    if (!type || !slug || !label) return null;

    const {
        TextControl,
        SelectControl,
        ToggleControl,
        RangeControl,
        __experimentalUnitControl,
        UnitControl: StableUnitControl,
        __experimentalNumberControl,
        NumberControl: StableNumberControl,
    } = wp.components || {};

    const UnitCtrl = StableUnitControl || __experimentalUnitControl;
    const NumberCtrl = StableNumberControl || __experimentalNumberControl;

    const classNames = [large ? '--full' : null].filter(Boolean).join(' ');
    const value = settings?.[slug];
    const inputId = `wpbs-${slug}`;

    // --- focus tracking ---
    const inputRef = useRef(null);
    const wasFocused = useRef(false);

    // remember focus before updates
    useLayoutEffect(() => {
        const node = inputRef.current;
        wasFocused.current = document.activeElement === node;
    });

    // restore focus after value or props change
    useLayoutEffect(() => {
        if (wasFocused.current && inputRef.current) {
            inputRef.current.focus();
            // optional: restore cursor position here if needed
        }
    }, [value]);
    // -----------------------

    const debouncedChange = useMemo(
        () => debounce((next) => callback(next), 500),
        [callback]
    );

    const change = useCallback(
        (next, immediate = false) => {
            if (immediate) callback(next);
            else debouncedChange(next);
        },
        [callback, debouncedChange]
    );

    let control = null;


    switch (type) {
        // ————— WP controls —————
        case 'select': {
            const opts = controlProps?.options || [];
            control = (
                <label className={`wpbs-layout-tools__field ${classNames}`} htmlFor={inputId}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --select">
                        <SelectControl
                            id={inputId}
                            value={value ?? ''}
                            options={opts}
                            // keep our visual label above; use aria-label for a11y inside control
                            label={undefined}
                            aria-label={label}
                            onChange={(val) => change(val)}
                            __nextHasNoMarginBottom
                        />
                    </div>
                </label>
            );
            break;
        }

        case 'text':
            control = (
                <label className={`wpbs-layout-tools__field ${classNames}`} htmlFor={inputId}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --text">
                        <TextControl
                            id={inputId}
                            value={value ?? ''}
                            label={undefined}
                            aria-label={label}
                            onChange={(val) => change(val)}
                            __nextHasNoMarginBottom
                            {...controlProps}
                        />
                    </div>
                </label>
            );
            break;

        case 'number':
            control = (
                <label className={`wpbs-layout-tools__field ${classNames}`} htmlFor={inputId}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --number">
                        <NumberCtrl
                            id={inputId}
                            value={value ?? ''}
                            label={undefined}
                            aria-label={label}
                            onChange={(val) => {
                                // NumberControl returns string or ''
                                change(val === '' ? '' : Number(val));
                            }}
                            ref={inputRef}
                            __nextHasNoMarginBottom
                            {...controlProps}
                        />
                    </div>
                </label>
            );
            break;

        case 'toggle':
            control = (
                <label className={`wpbs-layout-tools__field --toggle ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --toggle">
                        <ToggleControl
                            // ToggleControl renders its own label; keep ours visually separate
                            label={undefined}
                            aria-label={label}
                            checked={!!value}
                            onChange={(checked) => change(!!checked)}
                            __nextHasNoMarginBottom
                            {...controlProps}
                        />
                    </div>
                </label>
            );
            break;

        case 'range':
            control = (
                <label className={`wpbs-layout-tools__field ${classNames}`} htmlFor={inputId}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --range">
                        <RangeControl
                            value={
                                typeof value === 'number'
                                    ? value
                                    : controlProps.min ?? 0
                            }
                            min={controlProps.min ?? 0}
                            max={controlProps.max ?? 100}
                            step={controlProps.step ?? 1}
                            label={undefined}
                            aria-label={label}
                            onChange={(val) => change(Number(val))}
                            __nextHasNoMarginBottom
                            {...controlProps}
                        />
                    </div>
                </label>
            );
            break;

        case 'unit': {
            const units =
                controlProps.units ||
                [
                    {value: 'px', label: 'px'},
                    {value: 'em', label: 'em'},
                    {value: 'rem', label: 'rem'},
                    {value: '%', label: '%'},
                ];
            control = (
                <label className={`wpbs-layout-tools__field ${classNames}`} htmlFor={inputId}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --unit">
                        <UnitCtrl
                            id={inputId}
                            // UnitControl expects a string like "12px"
                            value={value ?? ''}
                            units={units}
                            label={undefined}
                            aria-label={label}
                            onChange={(val) => change(val)}
                            __nextHasNoMarginBottom
                            {...controlProps}
                        />
                    </div>
                </label>
            );
            break;
        }

        // ————— composite (recursive) —————
        case 'composite':
            control = (
                <div className={`wpbs-layout-tools__field --composite ${classNames}`}>
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

        // ————— keep heavyweight WP bits for now —————
        case 'shadow':
            control = (
                <div className={`wpbs-layout-tools__field ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --shadow">
                        <ShadowSelector
                            label={label}
                            value={value}
                            onChange={(val) => change(val)}
                        />
                    </div>
                </div>
            );
            break;

        case 'color':
            control = (
                <div className={`wpbs-layout-tools__field ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --color">
                        <PanelColorSettings
                            enableAlpha
                            colorSettings={[
                                {
                                    slug,
                                    label,
                                    value,
                                    onChange: (val) => change(val),
                                    isShownByDefault: true,
                                },
                            ]}
                        />
                    </div>
                </div>
            );
            break;

        case 'gradient':
            control = (
                <div className={`wpbs-layout-tools__field ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --gradient">
                        <GradientPicker
                            {...{
                                key: slug,
                                gradients: controlProps.gradients || [],
                                clearable: true,
                                value: value ?? field?.default ?? '',
                                onChange: (val) => change(val),
                            }}
                        />
                    </div>
                </div>
            );
            break;

        case 'box':
            control = (
                <div className={`wpbs-layout-tools__field ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --box">
                        <BoxControl
                            label={label}
                            values={value}
                            onChange={(val) => change(val)}
                            {...controlProps}
                        />
                    </div>
                </div>
            );
            break;

        case 'image':
        case 'video': {
            const allowedTypes = type === 'image' ? ['image'] : ['video'];
            const clear = () => change('');
            control = (
                <div className={`wpbs-layout-tools__field ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --media">
                        <MediaUploadCheck>
                            <MediaUpload
                                title={label}
                                onSelect={(val) => change(val)}
                                allowedTypes={allowedTypes}
                                value={value}
                                render={({open}) => (
                                    <PreviewThumbnail
                                        image={{...value, type: settings?.type}}
                                        callback={clear}
                                        style={{objectFit: 'contain'}}
                                        onClick={open}
                                    />
                                )}
                            />
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
