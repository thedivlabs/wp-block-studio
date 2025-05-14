import {SelectControl} from "@wordpress/components";
import React, {useState} from "react";


function Resolution({defaultValue, callback}) {

    return <SelectControl
        label={'Resolution'}
        value={defaultValue}
        options={[
            {label: 'Default', value: ''},
            {label: 'Small', value: 'small'},
            {label: 'Medium', value: 'medium'},
            {label: 'Large', value: 'large'},
            {label: 'Extra Large', value: 'xlarge'},
        ]}
        onChange={(newValue) => {
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default Resolution;
