import {SelectControl} from "@wordpress/components";
import {useState} from "react";


function FlexWrap({defaultValue, callback}) {

    const [value,setValue] = useState(defaultValue);

    return <SelectControl
        label={'Flex Wrap'}
        value={value}
        options={[
            {label: 'Select', value: ''},
            {label: 'Wrap', value: 'wrap'},
            {label: 'No Wrap', value: 'no-wrap'},
        ]}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default FlexWrap;
