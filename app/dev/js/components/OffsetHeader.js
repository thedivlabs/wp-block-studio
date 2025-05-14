import {
    __experimentalNumberControl as NumberControl,
} from "@wordpress/components";
import React, {useState} from "react";


function OffsetHeader({defaultValue, callback}) {

    return <NumberControl
        label={'Offset Header'}
        value={defaultValue}
        min={0}
        isDragEnabled={false}
        onChange={(newValue) => {
            callback(newValue);
        }}
        __next40pxDefaultSize
    />;
}

export default OffsetHeader;

