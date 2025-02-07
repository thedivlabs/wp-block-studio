import {
    __experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import {useState} from "react";


function OutlineOffset({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue);

    return <UnitControl
        label={'Outline Offset'}
        value={value}
        isResetValueOnUnitChange={true}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
    />;
}

export default OutlineOffset;
