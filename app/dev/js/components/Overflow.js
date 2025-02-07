import {SelectControl} from "@wordpress/components";
import {useState} from "react";


function Overflow({defaultValue, callback}) {

    const [value,setValue] = useState(defaultValue);

    return <SelectControl
        label={'Overflow'}
        value={value}
        options={[
            {label: 'Select', value: ''},
            {label: 'Hidden', value: 'hidden'},
            {label: 'Visible', value: 'visible'},
        ]}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default Overflow;
