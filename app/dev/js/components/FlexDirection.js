import {SelectControl} from "@wordpress/components";
import {useState} from "react";


function FlexDirection({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue);

    return <SelectControl
        label={'Direction'}
        value={value}
        options={[
            {label: 'Select', value: ''},
            {label: 'Row', value: 'row'},
            {label: 'Column', value: 'column'},
            {label: 'Row Reverse', value: 'row-reverse'},
            {label: 'Column Reverse', value: 'column-reverse'},
        ]}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default FlexDirection;
