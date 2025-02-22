import {
    ToggleControl
} from "@wordpress/components";
import React, {useState} from "react";


function OffsetHeader({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue);

    return <ToggleControl
        label={'Offset Header'}
        checked={value}
        onChange={(newValue) => {
            setValue(newValue);
            callback(newValue);
        }}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    />;
}

export default OffsetHeader;

