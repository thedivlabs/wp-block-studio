import {SelectControl} from "@wordpress/components";
import {useState} from "react";


function Container({defaultValue, callback}) {

    return <SelectControl
        label={'Container'}
        value={defaultValue}
        options={[
            {label: 'Select', value: ''},
            {label: 'None', value: 'none'},
            {label: 'Normal', value: 'normal'},
            {label: 'Small', value: 'sm'},
            {label: 'Extra Small', value: 'xs'},
            {label: 'Medium', value: 'md'},
            {label: 'Large', value: 'lg'},
        ]}
        onChange={(newValue) => {
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default Container;
