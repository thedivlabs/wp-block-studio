import React from "react";
import {
    BaseControl,
    TextControl,
    RangeControl,
    __experimentalGrid as Grid,
    __experimentalNumberControl as NumberControl,
    ToggleControl, SelectControl
} from '@wordpress/components';

function IconControl({value = {}, onChange, label = 'Icon'}) {

    const {name = '', weight = 400, size = 24, style = ''} = value;

    // helper to generate CSS
    const generateCSS = (fill, weight, opsz) =>
        `'FILL' ${parseInt(fill) || 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${opsz}`;


    // unified updater
    const update = (key, val) => {
        if (key === 'weight') val = Math.round(val / 100) * 100;
        const newVal = {...value, [key]: val};
        newVal.css = generateCSS(newVal.style, newVal.weight, newVal.size);
        onChange(newVal);
    };


    return (
        <BaseControl label={label} style={{gridColumn: '1/-1'}}>
            <Grid columns={2} columnGap={15} rowGap={20}>
                <TextControl
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                    label="Name"
                    value={name}
                    onChange={(val) => update('name', val)}
                    placeholder="e.g. home, search, star"
                />

                <NumberControl
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                    label="Size"
                    value={size}
                    onChange={(val) => update('size', val)}
                    min={20}
                    max={48}
                    step={1}
                />

                <NumberControl
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                    label="Weight"
                    value={size}
                    onChange={(val) => update('weight', val)}
                    min={100}
                    max={700}
                    step={100}
                />

                <SelectControl
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                    label="Style"
                    value={style}
                    options={[
                        {value: '', label: 'Select'},
                        {value: '1', label: 'Solid'},
                        {value: '0', label: 'Outlined'},
                    ]}
                    onChange={(val) => update('style', val !== '' ? Number(val) : '')}
                />


            </Grid>
        </BaseControl>
    );
}

export default IconControl;
