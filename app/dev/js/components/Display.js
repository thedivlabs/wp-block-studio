import {SelectControl} from "@wordpress/components";
import {useState} from "react";


function Display({defaultValue, callback}) {

    return <SelectControl
        label={'Display'}
        value={defaultValue}
        options={[
            {label: 'Select', value: ''},
            {label: 'Flex', value: 'flex'},
            {label: 'Block', value: 'block'},
            {label: 'Inline Flex', value: 'inline-flex'},
            {label: 'Inline Block', value: 'inline-block'},
            {label: 'None', value: 'none'},
        ]}
        onChange={(newValue) => {
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default Display;
