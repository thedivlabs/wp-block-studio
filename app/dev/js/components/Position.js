import {
    SelectControl
} from "@wordpress/components";
import {useState} from "react";


function Position({defaultValue, callback}) {

    return <SelectControl
        label={'Position'}
        value={defaultValue}
        options={[
            {label: 'Select', value: ''},
            {label: 'Relative', value: 'relative'},
            {label: 'Absolute', value: 'absolute'},
            {label: 'Sticky', value: 'sticky'},
            {label: 'Static', value: 'static'},
        ]}
        onChange={(newValue) => {
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default Position;
