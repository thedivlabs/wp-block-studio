import {SelectControl} from "@wordpress/components";
import {useState} from "react";


function Space({defaultValue, callback}) {

    const [value,setValue] = useState(defaultValue);

    return <SelectControl
        label={'Space'}
        value={value}
        options={[
            {label: 'Select', value: ''},
            {label: 'Grow', value: 'grow'},
            {label: 'Shrink', value: 'shrink'},
            {label: 'No Grow', value: 'no-grow'},
            {label: 'No Shrink', value: 'no-shrink'},
        ]}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default Space;
