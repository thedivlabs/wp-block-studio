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


export function IconControl({value = {}, onChange, label = 'Icon'}) {
    const {name = '', weight = 400, size = 24, style = 0} = value;
    const [isOpen, setIsOpen] = useState(false);

    const update = (key, val) => {
        if (key === 'weight') val = Math.round(val / 100) * 100;
        const newVal = {...value, [key]: val};
        onChange(newVal);
    };

    const previewStyle = {
        fontVariationSettings: `'FILL' ${style}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
        fontFamily: "'Material Symbols Outlined', sans-serif",
        fontSize: `${size}px`,
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        aspectRatio: '1/1',
        lineHeight: 1,
        verticalAlign: 'middle',
        width: 'auto',
        flexGrow: 0,
        height: '32px',
        textAlign: 'center',
    };

    return (
        <BaseControl label={label}>
            {/* Name input */}
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
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
                                    min={20}
                                    max={48}
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

export const MaterialIcon = ({
                                 name = 'home',
                                 weight = 400,
                                 size = 24,
                                 style = 0,
                                 className = '',
                                 ...props
                             }) => {
    const iconStyle = {
        fontVariationSettings: `'FILL' ${Number(style)}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
        fontSize: `${size}px`,
        fontFamily: `'Material Symbols Outlined', sans-serif`,
        display: 'inline-block',
        lineHeight: 1,
        verticalAlign: 'middle',
    };

    return <span
        className={`material-symbols-outlined ${className}`}
        style={iconStyle}
        {...props}
    >
      {name}
    </span>;
}
