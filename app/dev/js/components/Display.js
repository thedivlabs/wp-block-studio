import {SelectControl} from "@wordpress/components";
import {useState} from "react";


function Display({defaultValue, callback}) {

    const [value,setValue] = useState(defaultValue);

    return <SelectControl
        label={'Display'}
        value={value}
        options={[
            {label: 'Select', value: ''},
            {label: 'Flex Row', value: 'flex-row'},
            {label: 'Flex Column', value: 'flex-col'},
            {label: 'Flex Row Reverse', value: 'flex-row-reverse'},
            {label: 'Flex Column Reverse', value: 'flex-col-reverse'},
            {label: 'Block', value: 'block'},
            {label: 'None', value: 'none'},
        ]}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default Display;
