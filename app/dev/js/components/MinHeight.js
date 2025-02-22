import {
    __experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import {useState} from "react";


function MinHeight({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue || null);

    return <UnitControl
        label={'Min-Height'}
        value={value}
        isResetValueOnUnitChange={true}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
    />;
}

export default MinHeight;
