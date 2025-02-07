import {
    SelectControl,
} from "@wordpress/components";
import {useState} from "react";


function Height({defaultValue, callback}) {

    const [value,setValue] = useState(defaultValue);

    return <SelectControl
        label={'Height'}
        value={value}
        options={[
            {label: 'Select', value: ''},
            {label: 'Screen', value: 'screen'},
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

export default Height;
