import {SelectControl} from "@wordpress/components";
import {useState} from "react";


function Align({defaultValue, callback}) {


    return <SelectControl
        label={'Align'}
        value={defaultValue}
        options={[
            {label: 'Select', value: ''},
            {label: 'Start', value: 'flex-start'},
            {label: 'Center', value: 'center'},
            {label: 'End', value: 'flex-end'},
            {label: 'Stretch', value: 'stretch'},
        ]}
        onChange={(newValue) => {
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default Align;
