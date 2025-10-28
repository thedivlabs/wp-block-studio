import {memo} from '@wordpress/element';
import {
    PanelColorSettings,
    MediaUpload,
    MediaUploadCheck,
    __experimentalBoxControl as BoxControl,
    GradientPicker
} from '@wordpress/components';
import {ShadowSelector} from 'Components/ShadowSelector';
import PreviewThumbnail from 'Components/PreviewThumbnail';


export const Field = memo(({field, settings, callback}) => {
    const {type, slug, label, large = false, ...controlProps} = field;
    if (!type || !slug || !label) return null;

    const classNames = [large ? '--full' : null].filter(Boolean).join(' ');
    const value = settings?.[slug];
    const inputId = `wpbs-${slug}`;

    const change = (next) => callback(next);
    const onInput = (e) => change(e.target.value);

    let control = null;

    switch (type) {
        // ————— simple, native controls —————
        case 'select': {
            const opts = controlProps?.options || [];
            control = (
                <label className={`wpbs-layout-tools__field ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --select">
                        <select value={value ?? ''} onChange={onInput} id={inputId}>
                            {opts.map((o) => (
                                <option key={o.value} value={o.value} disabled={o.disabled}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </label>
            );
            break;
        }

        case 'text':
            control = (
                <label className={`wpbs-layout-tools__field ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --text">
                        <input
                            type="text"
                            value={value ?? ''}
                            onChange={onInput}
                        />
                    </div>
                </label>
            );
            break;

        case 'number':
            control = (
                <label className={`wpbs-layout-tools__field ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --number">
                        <input
                            type="number"
                            value={value ?? ''}
                            onChange={(e) => {
                                const v = e.target.value;
                                change(v === '' ? '' : Number.isNaN(Number(v)) ? '' : Number(v));
                            }}
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
                        <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) => change(e.target.checked)}
                        />
                    </div>
                </label>
            );
            break;

        case 'range':
            control = (
                <label className={`wpbs-layout-tools__field ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --range">
                        <input
                            type="range"
                            value={
                                typeof value === 'number'
                                    ? value
                                    : controlProps.min ?? 0
                            }
                            min={controlProps.min ?? 0}
                            max={controlProps.max ?? 100}
                            step={controlProps.step ?? 1}
                            onChange={(e) => change(Number(e.target.value))}
                        />
                    </div>
                </label>
            );
            break;

        case 'unit':
            control = (
                <label className={`wpbs-layout-tools__field ${classNames}`}>
                    <strong className="wpbs-layout-tools__label">{label}</strong>
                    <div className="wpbs-layout-tools__control --unit">
                        <input
                            type="text"
                            value={value ?? ''}
                            onChange={onInput}
                            placeholder="e.g. 12px, 2rem, 50%"
                        />
                    </div>
                </label>
            );
            break;

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