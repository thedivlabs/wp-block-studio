import {
    SelectControl,
} from "@wordpress/components";
import {useState} from "react";


function Width({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue);

    return <SelectControl
        label={'Width'}
        value={value}
        options={[
            {label: 'Select', value: ''},
            {label: 'Auto', value: 'auto'},
            {label: 'Fit', value: 'fit-content'},
            {label: 'Full', value: '100%'},
        ]}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default Width;
