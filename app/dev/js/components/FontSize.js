import {
    __experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import {useState} from "react";


function FontSize({defaultValue, callback}) {

    return <UnitControl
        label={'Font Size'}
        value={defaultValue}
        isResetValueOnUnitChange={true}
        onChange={(newValue) => {
            callback(newValue);
        }}
        units={[
            {value: 'px', label: 'px', default: 0},
            {value: '%', label: '%', default: 0},
            {value: 'em', label: 'em', default: 0},
            {value: 'rem', label: 'rem', default: 0},
            {value: 'vw', label: 'vw', default: 0},
        ]}
        __next40pxDefaultSize
    />;
}

export default FontSize;
