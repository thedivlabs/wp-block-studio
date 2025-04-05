import {
    SelectControl,
} from "@wordpress/components";
import {useState} from "react";


function MinHeight({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue);

    return <SelectControl
        label={'Min-Height'}
        value={value}
        options={[
            {label: 'Select', value: ''},
            {label: 'Screen', value: 'screen'},
            {label: 'Full Screen', value: 'full-screen'},
            {label: 'Full', value: '100%'},
            {label: 'Auto', value: 'auto'},
        ]}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default MinHeight;
