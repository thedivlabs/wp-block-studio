import {SelectControl} from "@wordpress/components";
import {useState} from "react";


function FlexWrap({defaultValue, callback}) {

    return <SelectControl
        label={'Flex Wrap'}
        value={defaultValue}
        options={[
            {label: 'Select', value: ''},
            {label: 'Wrap', value: 'wrap'},
            {label: 'No Wrap', value: 'no-wrap'},
        ]}
        onChange={(newValue) => {
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default FlexWrap;
