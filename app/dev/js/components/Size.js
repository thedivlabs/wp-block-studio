import {SelectControl} from "@wordpress/components";
import React, {useState} from "react";


function Size({defaultValue, callback}) {


    return <SelectControl
        label={'Size'}
        value={defaultValue}
        options={[
            {label: 'Default', value: 'contain'},
            {label: 'Cover', value: 'cover'},
            {label: 'Vertical', value: 'auto 100%'},
            {label: 'Horizontal', value: '100% auto'},
        ]}
        onChange={(newValue) => {
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default Size;
