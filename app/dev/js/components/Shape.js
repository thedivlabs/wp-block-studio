import {SelectControl} from "@wordpress/components";
import {useState} from "react";


function Shape({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue);

    return <SelectControl
        label={'Shape'}
        value={value}
        options={[
            {label: 'Select', value: ''},
            {label: 'Square', value: 'square'},
            {label: 'Video', value: 'video'},
            {label: 'Photo', value: 'photo'},
            {label: 'Tele', value: 'tele'},
            {label: 'Tall', value: 'tall'},
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

export default Shape;
