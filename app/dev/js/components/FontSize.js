import {
    __experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import {useState} from "react";


function FontSize({defaultValue, callback}) {

    const [value,setValue] = useState(defaultValue);

    return <UnitControl
        label={'Font Size'}
        value={value}
        isResetValueOnUnitChange={true}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
    />;
}

export default FontSize;
