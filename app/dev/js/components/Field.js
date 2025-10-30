import {memo, useMemo, useCallback, useRef} from '@wordpress/element';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';

export const Field = memo(({field, settings, callback}) => {
    const {type, slug, label, large = false, ...controlProps} = field;
    if (!type || !slug || !label) return null;

    const {
        TextControl,
        SelectControl,
        ToggleControl,
        RangeControl,
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
        () => debounce((next) => safeCallback(next), 1200),
        [safeCallback]
    );

    // cancel timeout if user pauses too long
    const scheduleCancel = useCallback(() => {
        clearTimeout(cancelRef.current);
        cancelRef.current = setTimeout(() => {
            debouncedChange.cancel(); // cancel pending commits
        }, 1200); // 2s of inactivity cancels the debounce entirely
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

    // Commit on blur (focus out)
    const handleBlur = useCallback(() => commitNow(), [commitNow]);

    let control = null;

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
                            __nextHasNoMarginBottom
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
                            __nextHasNoMarginBottom
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
                            onChange={(v) => commitNow(v)}
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
                            __nextHasNoMarginBottom
                            {...controlProps}
                        />
                    </div>
                </label>
            );
            break;

        default:
            control = null;
    }

    return control;
});
