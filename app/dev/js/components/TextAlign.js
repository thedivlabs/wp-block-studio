import {SelectControl} from "@wordpress/components";
import {useState} from "react";


function TextAlign({defaultValue, callback}) {

    const [value,setValue] = useState(defaultValue);

    return <SelectControl
        label={'TextAlign'}
        value={value}
        options={[
            {label: 'Select', value: ''},
            {label: 'Left', value: 'left'},
            {label: 'Center', value: 'center'},
            {label: 'Right', value: 'right'},
            {label: 'Inherit', value: 'inherit'},
        ]}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default TextAlign;
