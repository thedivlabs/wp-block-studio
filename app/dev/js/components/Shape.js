import {SelectControl} from "@wordpress/components";
import {useState} from "react";


function Shape({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue);

    return <SelectControl
        label={'Shape'}
        value={value}
        options={[
            {label: 'Select', value: ''},
            {label: 'Square', value: '1/1'},
            {label: 'Video', value: '16/9'},
            {label: 'Photo', value: '10/8'},
            {label: 'Tele', value: '5/6'},
            {label: 'Tall', value: '1/1.4'},
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
