import { __experimentalNumberControl as NumberControl } from '@wordpress/components';
import {useState} from "react";


function ZIndex({defaultValue, callback}) {

    return <NumberControl
        label={'Z-Index'}
        value={defaultValue}
        spinControls={'native'}
        isDragEnabled={false}
        onChange={(newValue) => {
            callback(newValue);
        }}
        __next40pxDefaultSize
    />;
}

export default ZIndex;
