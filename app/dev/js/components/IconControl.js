import React, {useState} from 'react';
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

export function iconProps(prop, key = '') {

    const propName = '--' + [
        'icon',
        key,
    ].filter(x => !!x).join('-');

    return {
        [propName]: prop?.name ? '"' + prop.name + '"' : null,
        [propName + '-size']: prop?.size ? prop.size + 'px' : null,
        [propName + '-css']: prop?.css ?? null,
    }


}

export function IconControl({value = {}, onChange, label = 'Icon', defaultValue = ''}) {
    const {name = defaultValue, weight = 300, size = 24, style = 0} = value;
    const [isOpen, setIsOpen] = useState(false);

    const generateCSS = (fill, weight, opsz) => {
        return `'FILL' ${parseInt(fill) || 0}, 'wght' ${weight || 300}, 'GRAD' 0, 'opsz' ${opsz || 24}`;
    };

    const update = (key, val) => {
        if (key === 'weight') val = Math.round(val / 100) * 100;
        const newVal = {...value, [key]: val};
        newVal.css = generateCSS(newVal?.style ?? 0, newVal?.weight ?? 300, newVal?.size || 24);
        onChange(newVal);
    };

    const previewStyle = {
        flexGrow: 0,
        fontVariationSettings: generateCSS(value?.style ?? 0, value?.weight ?? 300, 26),
        fontFamily: "'Material Symbols Outlined', sans-serif",
        fontSize: '26px',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        lineHeight: 1,
        verticalAlign: 'middle',
        width: '32px',
        height: '32px',
        textAlign: 'center',
    };

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
                <div style={previewStyle}>{name || 'home'}</div>

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
                                <NumberControl
                                    label="Weight"
                                    value={weight}
                                    onChange={(val) => update('weight', val)}
                                    min={100}
                                    max={700}
                                    step={100}
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

export const MaterialIcon = ({name, weight, size, style = 0, className = ''}) => {

    const css = `'FILL' ${Number(style || 0)}, 'wght' ${weight || 300}, 'GRAD' 0, 'opsz' ${size || 24}`;

    const iconStyle = {
        fontVariationSettings: css,
        display: 'inline-flex',
        fontSize: `${size}px`,
    };

    return !name ? null : <span
        className={`material-symbols-outlined ${className}`}
        style={iconStyle}
    >
            {name}
        </span>;
};
