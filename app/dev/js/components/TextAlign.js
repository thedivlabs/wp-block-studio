import {SelectControl} from "@wordpress/components";
import {useState} from "react";


function TextAlign({defaultValue, callback}) {


    return <SelectControl
        label={'TextAlign'}
        value={defaultValue}
        options={[
            {label: 'Select', value: ''},
            {label: 'Left', value: 'left'},
            {label: 'Center', value: 'center'},
            {label: 'Right', value: 'right'},
            {label: 'Inherit', value: 'inherit'},
        ]}
        onChange={(newValue) => {
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default TextAlign;
