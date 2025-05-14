import {
    SelectControl,
} from "@wordpress/components";
import {useState} from "react";


function Height({defaultValue, callback}) {

    return <SelectControl
        label={'Height'}
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

export default Height;
