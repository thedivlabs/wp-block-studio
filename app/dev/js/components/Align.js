import {SelectControl} from "@wordpress/components";
import {useState} from "react";


function Align({defaultValue, callback}) {

    const [value,setValue] = useState(defaultValue);

    return <SelectControl
        label={'Align'}
        value={value}
        options={[
            {label: 'Select', value: ''},
            {label: 'Start', value: 'flex-start'},
            {label: 'Center', value: 'center'},
            {label: 'End', value: 'flex-end'},
            {label: 'Stretch', value: 'stretch'},
        ]}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default Align;
