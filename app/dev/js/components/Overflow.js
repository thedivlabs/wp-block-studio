import {SelectControl} from "@wordpress/components";
import {useState} from "react";


function Overflow({defaultValue, callback}) {

    return <SelectControl
        label={'Overflow'}
        value={defaultValue}
        options={[
            {label: 'Select', value: ''},
            {label: 'Hidden', value: 'hidden'},
            {label: 'Visible', value: 'visible'},
        ]}
        onChange={(newValue) => {
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default Overflow;
