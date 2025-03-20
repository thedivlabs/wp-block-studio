import {SelectControl} from "@wordpress/components";
import React, {useState} from "react";


function Blend({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue || 0);

    return <SelectControl
        label={'Blend'}
        value={value}
        options={[
            {label: 'Default', value: ''},
            {label: 'Multiply', value: 'multiply'},
            {label: 'Luminosity', value: 'luminosity'},
            {label: 'Screen', value: 'screen'},
            {label: 'Overlay', value: 'overlay'},
            {label: 'Soft Light', value: 'soft-light'},
            {label: 'Hard Light', value: 'hard-light'},
            {label: 'Difference', value: 'difference'},
            {label: 'Color Burn', value: 'color-burn'},
        ]}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default Blend;
