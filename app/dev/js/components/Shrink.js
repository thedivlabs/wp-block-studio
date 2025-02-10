import {__experimentalNumberControl as NumberControl} from '@wordpress/components';
import {useState} from "react";


function Shrink({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue);

    return <NumberControl
        label={'Shrink'}
        value={value}
        min={0}
        isDragEnabled={false}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
    />;
}

export default Shrink;
