import {
    __experimentalUnitControl as UnitControl
} from '@wordpress/components';
import {useState} from "react";


function WidthCustom({defaultValue, callback, label = 'Width Custom'}) {

    return <UnitControl
        label={label}
        value={defaultValue}
        units={[
            {value: 'px', label: 'px', default: 0},
            {value: '%', label: '%', default: 0},
            {value: 'em', label: 'em', default: 0},
            {value: 'rem', label: 'rem', default: 0},
            {value: 'vh', label: 'vh', default: 0},
            {value: 'vw', label: 'vw', default: 0},
            {value: 'ch', label: 'ch', default: 0},
        ]}
        isResetValueOnUnitChange={true}
        onChange={(newValue) => {
            callback(newValue);
        }}
        __next40pxDefaultSize
    />;
}

export default WidthCustom;
