import {
    SelectControl,
} from "@wordpress/components";
import {useState} from "react";


function Width({defaultValue, callback}) {


    return <SelectControl
        label={'Width'}
        value={defaultValue}
        options={[
            {label: 'Select', value: ''},
            {label: 'Auto', value: 'auto'},
            {label: 'Fit', value: 'fit-content'},
            {label: 'Full', value: '100%'},
        ]}
        onChange={(newValue) => {
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default Width;
