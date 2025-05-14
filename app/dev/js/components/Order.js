import { __experimentalNumberControl as NumberControl } from '@wordpress/components';
import {useState} from "react";


function Order({defaultValue, callback}) {

    return <NumberControl
        label={'Order'}
        value={defaultValue}
        spinControls={'native'}
        isDragEnabled={false}
        onChange={(newValue) => {
            callback(newValue);
        }}
        __next40pxDefaultSize
    />;
}

export default Order;
