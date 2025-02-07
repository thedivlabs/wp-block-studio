import { __experimentalNumberControl as NumberControl } from '@wordpress/components';
import {useState} from "react";


function ZIndex({defaultValue, callback}) {

    const [value,setValue] = useState(defaultValue);

    return <NumberControl
        label={'Z-Index'}
        value={value}
        spinControls={'native'}
        isDragEnabled={false}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
    />;
}

export default ZIndex;
