import {__experimentalNumberControl as NumberControl} from '@wordpress/components';
import {useState} from "react";


function Grow({defaultValue, callback}) {

    return <NumberControl
        label={'Grow'}
        value={defaultValue}
        min={0}
        isDragEnabled={false}
        onChange={(newValue) => {
            callback(newValue);
        }}
        __next40pxDefaultSize
    />;
}

export default Grow;
