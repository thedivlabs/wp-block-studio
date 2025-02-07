import {
    __experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import {useState} from "react";


function HeightCustom({defaultValue, callback}) {

    const [value,setValue] = useState(defaultValue || null);

    return <UnitControl
        label={'Height Custom'}
        value={value}
        isResetValueOnUnitChange={true}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
    />;
}

export default HeightCustom;
