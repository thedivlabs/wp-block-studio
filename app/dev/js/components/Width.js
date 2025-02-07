import {
    __experimentalUnitControl as UnitControl
} from '@wordpress/components';
import {useState} from "react";


function Width({defaultValue, callback, label = 'Width'}) {

    const [value, setValue] = useState(defaultValue);

    return <UnitControl
        label={label}
        value={value}
        isResetValueOnUnitChange={true}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
    />;
}

export default Width;
