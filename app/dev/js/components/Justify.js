import {SelectControl} from "@wordpress/components";
import {useState} from "react";


function Justify({defaultValue, callback}) {

    return <SelectControl
        label={'Justify'}
        value={defaultValue}
        options={[
            {label: 'Select', value: ''},
            {label: 'Start', value: 'flex-start'},
            {label: 'Center', value: 'center'},
            {label: 'End', value: 'flex-end'},
            {label: 'Between', value: 'space-between'},
        ]}
        onChange={(newValue) => {
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default Justify;
