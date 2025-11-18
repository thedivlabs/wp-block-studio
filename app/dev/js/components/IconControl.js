import {
    BaseControl,
    TextControl,
    RangeControl,
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    ToggleControl, SelectControl,
    Button,
    Popover,
} from '@wordpress/components';
import {useSetting} from "@wordpress/block-editor";
import {useEffect, useMemo, useState, useCallback, memo} from "@wordpress/element";
import {debounce, isEqual} from "lodash";

export function iconProps(prop, key = '') {

    const propName = '--' + [
        'icon',
        key,
    ].filter(x => !!x).join('-');

    return {
        [propName]: prop?.name ? '"' + prop.name + '"' : null,
        [propName + '-size']: prop?.size ? prop.size + 'px' : null,
        [propName + '-css']: prop?.css ?? null,
        [propName + '-weight']: prop?.weight ?? null,
    }


}

const generateCSS = (fill, weight, opsz) => {
    return `'FILL' ${parseInt(fill) || 0}, 'wght' ${weight || 300}, 'GRAD' 0, 'opsz' ${opsz || 24}`;
};

const IconPreview = memo(({name, weight, size, style}) => {
    const previewStyle = {
        flexGrow: 0,
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        lineHeight: 1,
        verticalAlign: 'middle',
        width: '32px',
        height: '32px',
        objectFit: 'contain',
        objectPosition: 'center',
    };

    return <img
        src={`https://fonts.gstatic.com/s/i/materialsymbolsoutlined/${name}/${weight}/${size}px.png`} alt={name}
        style={previewStyle}
    />;

}, (prev, next) => isEqual(prev, next));

export const IconControl = ({
                                fieldKey,
                                props,
                                value = {},
                                onChange,
                                label = 'Icon',
                            }) => {

    const [local, setLocal] = useState(value)

    const fieldId = [fieldKey, props?.clientId].join('-');

    const {weight = 300, size = 24, style = 0} = value;
    const [isOpen, setIsOpen] = useState(false);

    const icons = props.attributes['wpbs-icons'] || [];

    const themeWeights = useSetting('custom')?.icons ?? '';

    const commit = useMemo(() =>
            debounce((next) => {

                // -- Normalize fields
                const normalized = {
                    ...next,
                    name: next?.name,
                    weight: next?.weight ?? 300,
                    size: next?.size ?? 24,
                    style: next?.style ?? 0,
                };

                normalized.css = generateCSS(
                    normalized.style,
                    normalized.weight,
                    normalized.size
                );

                // 1. Update the block's icon value
                onChange(normalized);

                // 2. Update wpbs-icons
                const nextIcons = [
                    ...icons.filter(icon => icon.key !== fieldId),
                    normalized.name
                        ? {
                            key: fieldId,
                            name: normalized.name,
                            style: normalized.style,
                            weight: normalized.weight,
                            grade: normalized.grade ?? 0,
                            opsz: normalized.size,
                            fill: normalized.style,
                        }
                        : null
                ].filter(Boolean);

                props.setAttributes({'wpbs-icons': nextIcons});

            }, 200)
        , []);

    const update = (key, val) => {
        setLocal(prev => ({
            ...prev,
            [key]: val
        }));
    };


    useEffect(() => {
        if (!isEqual(local, value)) {
            commit(local);
        }
    }, [local]);


    const weightOptions = themeWeights.replace(' ', '').split(',').map(weight => {
        return {value: weight.toString(), label: weight.toString()};
    })

    return (
        <BaseControl label={label} style={{marginBottom: 0}}>
            {/* Name input */}
            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                <TextControl
                    value={name}
                    onChange={(val) => update('name', val)}
                    placeholder="Icon name"
                    style={{flex: 1}}
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                />

                {/* Preview div */}
                <IconPreview name={name} weight={weight} size={size} style={style}/>

                {/* Settings button */}
                <div>
                    <Button
                        variant="secondary"
                        onClick={() => setIsOpen(!isOpen)}
                        icon="admin-generic"
                    />

                    {isOpen && (
                        <Popover position="bottom right" onClose={() => setIsOpen(false)}>
                            <Grid columns={1} rowGap={15} style={{padding: '10px', width: '200px'}}>
                                <NumberControl
                                    label="Size"
                                    value={size}
                                    onChange={(val) => update('size', val)}
                                    min={6}
                                    max={120}
                                    step={1}
                                />
                                <SelectControl
                                    label="Style"
                                    value={weight.toString()}
                                    onChange={(val) => update('weight', val)}
                                    options={[
                                        {value: '', label: 'Select'},
                                        ...weightOptions
                                    ]}
                                />
                                <SelectControl
                                    label="Style"
                                    value={style}
                                    options={[
                                        {value: '', label: 'Select'},
                                        {value: 1, label: 'Solid'},
                                        {value: 0, label: 'Outlined'},
                                    ]}
                                    onChange={(val) => update('style', val !== '' ? Number(val) : '')}
                                />
                            </Grid>
                        </Popover>
                    )}
                </div>
            </div>
        </BaseControl>
    );
}

export const MaterialIcon = ({name, weight = 300, size, style = 0, className = ''}) => {

    const css = `'FILL' ${Number(style || 0)}, 'wght' ${weight || 300}, 'GRAD' 0, 'opsz' ${size || 24}`;

    const iconStyle = {
        fontVariationSettings: css,
        display: 'inline-flex',
        fontSize: `${size}px`,
        fontWeight: `${weight}`,
    };

    return !name ? null : <span
        className={`material-symbols-outlined ${className}`}
        style={iconStyle}
    >
            {name}
        </span>;
};
