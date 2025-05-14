import {
    SelectControl,
} from "@wordpress/components";
import {useState} from "react";


function MinHeight({defaultValue, callback}) {

    return <SelectControl
        label={'Min-Height'}
        value={defaultValue}
        options={[
            {label: 'Select', value: ''},
            {label: 'Screen', value: 'screen'},
            {label: 'Full Screen', value: 'full-screen'},
            {label: 'Full', value: '100%'},
            {label: 'Auto', value: 'auto'},
            {label: 'Inherit', value: 'inherit'},
        ]}
        onChange={(newValue) => {
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default MinHeight;
