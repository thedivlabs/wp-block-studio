import {SelectControl} from "@wordpress/components";
import {useState} from "react";


function Breakpoint({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue);

    return <SelectControl
        label={'Breakpoint'}
        value={value}
        options={[
            {label: 'Select', value: ''},
            {label: 'Extra Small', value: 'xs'},
            {label: 'Small', value: 'sm'},
            {label: 'Medium', value: 'md'},
            {label: 'Large', value: 'lg'},
            {label: 'Extra Large', value: 'xl'}
        ]}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default Breakpoint;
