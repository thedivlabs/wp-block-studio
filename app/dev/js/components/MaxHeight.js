import {
    SelectControl,
} from "@wordpress/components";
import {useState} from "react";


function MaxHeight({defaultValue, callback}) {

    return <SelectControl
        label={'Max-Height'}
        value={defaultValue}
        options={[
            {label: 'Select', value: ''},
            {label: 'Screen', value: 'screen'},
            {label: 'Full', value: '100%'},
            {label: 'Auto', value: 'auto'},
        ]}
        onChange={(newValue) => {
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default MaxHeight;
