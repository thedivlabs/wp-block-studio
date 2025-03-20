import {SelectControl} from "@wordpress/components";
import React, {useState} from "react";


function Origin({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue || 0);

    return <SelectControl
        label={'Origin'}
        value={value}
        options={[
            {label: 'Default', value: undefined},
            {label: 'Center', value: 'center'},
            {label: 'Top', value: 'top'},
            {label: 'Right', value: 'right'},
            {label: 'Bottom', value: 'bottom'},
            {label: 'Left', value: 'left'},
            {label: 'Top Left', value: 'left top'},
            {label: 'Top Right', value: 'right top'},
            {label: 'Bottom Left', value: 'left bottom'},
            {label: 'Bottom Right', value: 'right bottom'},
        ]}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default Origin;
