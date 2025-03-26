import {
    __experimentalNumberControl as NumberControl,
} from "@wordpress/components";
import React, {useState} from "react";


function OffsetHeader({defaultValue, callback}) {

    const [value, setValue] = useState(defaultValue);

    return <NumberControl
        label={'Offset Header'}
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

export default OffsetHeader;

